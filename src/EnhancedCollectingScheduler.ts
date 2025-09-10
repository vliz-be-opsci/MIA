import AffordanceEntity from "./AffordanceEntity";
import { SmartBackoffStrategy } from "./SmartBackoffStrategy";
import { WorkerPoolManager } from "./WorkerPoolManager";
import { WorkerTask } from "./DataCollectionWorker";

export interface SchedulerConfig {
  enableWorkers: boolean;
  maxWorkers?: number;
  fallbackToSequential: boolean;
  workerTimeout?: number;
}

export default class EnhancedCollectingScheduler {
  schedule: any[];
  private backoffStrategy: SmartBackoffStrategy;
  private workerPool: WorkerPoolManager | null = null;
  private config: SchedulerConfig;
  private performanceMetrics: {
    totalProcessed: number;
    totalErrors: number;
    averageProcessingTime: number;
    startTime: number;
    parallelTasks: number;
    sequentialTasks: number;
  };

  constructor(config?: Partial<SchedulerConfig>) {
    this.schedule = [];
    this.backoffStrategy = new SmartBackoffStrategy();
    this.config = {
      enableWorkers: true,
      maxWorkers: Math.max(2, Math.min(navigator.hardwareConcurrency || 4, 6)),
      fallbackToSequential: true,
      workerTimeout: 10000, // 10 seconds
      ...config
    };
    
    this.performanceMetrics = {
      totalProcessed: 0,
      totalErrors: 0,
      averageProcessingTime: 0,
      startTime: Date.now(),
      parallelTasks: 0,
      sequentialTasks: 0
    };

    this.initializeWorkerPool();
  }

  private async initializeWorkerPool(): Promise<void> {
    if (this.config.enableWorkers && typeof Worker !== 'undefined') {
      try {
        this.workerPool = new WorkerPoolManager({
          maxWorkers: this.config.maxWorkers,
          maxQueueSize: 50,
          workerIdleTimeout: 30000
        });
        
        await this.workerPool.initialize();
        console.log('Enhanced Collecting Scheduler initialized with Web Workers');
      } catch (error) {
        console.warn('Failed to initialize worker pool, falling back to sequential processing:', error);
        this.workerPool = null;
      }
    } else {
      console.log('Enhanced Collecting Scheduler initialized without Web Workers');
    }
  }

  async queueAffordance(affordance: AffordanceEntity) {
    this.schedule.push(affordance);
    
    if (this.schedule.length === 1) {
      // Start processing if this is the first item
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    while (this.schedule.length > 0) {
      const ae = this.schedule.shift();
      
      try {
        if (this.shouldUseWorker()) {
          await this.processWithWorker(ae);
        } else {
          await this.processSequentially(ae);
        }
      } catch (error) {
        console.error('Error processing affordance:', error);
        this.updatePerformanceMetrics(0, true, false);
      }
    }
  }

  private shouldUseWorker(): boolean {
    return !!(
      this.workerPool && 
      this.config.enableWorkers && 
      this.schedule.length > 1 // Use workers when there are multiple items to process
    );
  }

  private async processWithWorker(affordance: AffordanceEntity): Promise<void> {
    if (!this.workerPool) {
      return this.processSequentially(affordance);
    }

    const url = affordance.getLink();
    const domain = SmartBackoffStrategy.extractDomain(url);
    
    // Calculate delay based on backoff strategy
    const delay = this.backoffStrategy.calculateDelay(domain);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const startTime = Date.now();
    
    try {
      const task: WorkerTask = {
        id: `task-${Date.now()}-${Math.random()}`,
        url,
        config: {}
      };

      // Submit task to worker pool with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Worker task timeout')), this.config.workerTimeout!);
      });

      const workerPromise = this.workerPool.submitTask(task);
      const response = await Promise.race([workerPromise, timeoutPromise]);

      if (response.success) {
        // Apply worker results to the affordance
        // Note: This is a simplified approach - in a real implementation,
        // you'd need to integrate this with the actual data collection pipeline
        this.backoffStrategy.recordSuccess(response.processingTime, domain);
        this.updatePerformanceMetrics(response.processingTime, false, true);
      } else {
        throw new Error(response.error || 'Worker task failed');
      }

    } catch (error) {
      this.backoffStrategy.recordFailure(error, domain);
      this.updatePerformanceMetrics(Date.now() - startTime, true, true);
      
      // Fallback to sequential processing if configured
      if (this.config.fallbackToSequential) {
        console.warn('Worker failed, falling back to sequential processing:', error);
        return this.processSequentially(affordance);
      } else {
        throw error;
      }
    }
  }

  private async processSequentially(affordance: AffordanceEntity): Promise<void> {
    const url = affordance.getLink();
    const domain = SmartBackoffStrategy.extractDomain(url);
    
    // Calculate smart delay based on performance metrics
    const delay = this.backoffStrategy.calculateDelay(domain);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const startTime = Date.now();
    
    try {
      await affordance.collectInfo();
      
      // Record successful processing
      const processingTime = Date.now() - startTime;
      this.backoffStrategy.recordSuccess(processingTime, domain);
      this.updatePerformanceMetrics(processingTime, false, false);
      
    } catch (error) {
      // Record failure for backoff strategy
      this.backoffStrategy.recordFailure(error, domain);
      this.updatePerformanceMetrics(Date.now() - startTime, true, false);
      
      // Retry logic with smart backoff
      if (this.backoffStrategy.shouldRetry(domain)) {
        // Re-queue the affordance for retry
        this.schedule.unshift(affordance);
      }
      
      throw error;
    }
  }

  private updatePerformanceMetrics(processingTime: number, isError: boolean, usedWorker: boolean): void {
    this.performanceMetrics.totalProcessed++;
    
    if (isError) {
      this.performanceMetrics.totalErrors++;
    }
    
    if (usedWorker) {
      this.performanceMetrics.parallelTasks++;
    } else {
      this.performanceMetrics.sequentialTasks++;
    }
    
    // Update rolling average processing time
    if (this.performanceMetrics.averageProcessingTime === 0) {
      this.performanceMetrics.averageProcessingTime = processingTime;
    } else {
      this.performanceMetrics.averageProcessingTime = 
        (this.performanceMetrics.averageProcessingTime * 0.9) + (processingTime * 0.1);
    }
  }

  /**
   * Get comprehensive performance metrics
   */
  getPerformanceMetrics(): any {
    const runTime = Date.now() - this.performanceMetrics.startTime;
    const throughput = this.performanceMetrics.totalProcessed / (runTime / 1000); // requests per second
    
    const baseMetrics = {
      ...this.performanceMetrics,
      runTime,
      throughput,
      errorRate: this.performanceMetrics.totalErrors / Math.max(this.performanceMetrics.totalProcessed, 1),
      queueLength: this.schedule.length,
      workerUtilization: this.performanceMetrics.parallelTasks / Math.max(this.performanceMetrics.totalProcessed, 1)
    };

    if (this.workerPool) {
      return {
        ...baseMetrics,
        workerPool: this.workerPool.getMetrics()
      };
    }

    return baseMetrics;
  }

  /**
   * Get backoff strategy metrics for a specific domain
   */
  getBackoffMetrics(domain?: string): any {
    return this.backoffStrategy.getPerformanceMetrics(domain);
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.performanceMetrics = {
      totalProcessed: 0,
      totalErrors: 0,
      averageProcessingTime: 0,
      startTime: Date.now(),
      parallelTasks: 0,
      sequentialTasks: 0
    };
  }

  /**
   * Enable or disable worker usage
   */
  setWorkerEnabled(enabled: boolean): void {
    this.config.enableWorkers = enabled;
  }

  /**
   * Get current configuration
   */
  getConfig(): SchedulerConfig {
    return { ...this.config };
  }

  /**
   * Shutdown the scheduler and clean up resources
   */
  async shutdown(): Promise<void> {
    if (this.workerPool) {
      await this.workerPool.shutdown();
      this.workerPool = null;
    }
    
    this.schedule = [];
  }
}
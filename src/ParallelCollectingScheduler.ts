import AffordanceEntity from "./AffordanceEntity";
import PerformanceMonitor, { RequestMetrics } from "./PerformanceMonitor";
import { ICollectingScheduler } from "./SchedulerFactory";

/**
 * Parallel data collection scheduler with smart backoff and concurrency control
 */
export default class ParallelCollectingScheduler implements ICollectingScheduler {
  private queue: AffordanceEntity[] = [];
  private performanceMonitor: PerformanceMonitor;
  private isProcessing: boolean = false;
  private maxConcurrency: number;
  private activeRequests: Set<Promise<void>> = new Set();

  constructor(maxConcurrency: number = 3) {
    console.debug(`Parallel Collecting Scheduler initialized with max concurrency: ${maxConcurrency}`);
    this.maxConcurrency = Math.max(1, Math.min(maxConcurrency, 8)); // Limit between 1-8
    this.performanceMonitor = new PerformanceMonitor();
  }

  async queueAffordance(affordance: AffordanceEntity): Promise<void> {
    this.queue.push(affordance);
    console.debug(`Affordance queued: ${affordance.getLink()} (queue size: ${this.queue.length})`);
    
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  /**
   * Queue affordance with high priority, moving it to front of queue
   * and cancelling any existing requests for the same link
   */
  async prioritizeAffordance(affordance: AffordanceEntity): Promise<void> {
    const link = affordance.getLink();
    
    // Remove any existing entries for the same link
    this.queue = this.queue.filter(item => item.getLink() !== link);
    
    // Add to front of queue for immediate processing
    this.queue.unshift(affordance);
    
    console.debug(`Affordance prioritized: ${link} (queue size: ${this.queue.length})`);
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    console.debug("Starting parallel processing");

    try {
      while (this.queue.length > 0 || this.activeRequests.size > 0) {
        // Fill up to max concurrency
        while (this.queue.length > 0 && this.activeRequests.size < this.getEffectiveConcurrency()) {
          const affordance = this.queue.shift()!;
          const requestPromise = this.processAffordanceWithRetry(affordance);
          
          this.activeRequests.add(requestPromise);
          
          // Remove from active requests when done
          requestPromise.finally(() => {
            this.activeRequests.delete(requestPromise);
          });
        }

        // Wait for at least one request to complete before continuing
        if (this.activeRequests.size > 0) {
          await Promise.race(this.activeRequests);
        }

        // Calculate adaptive delay between batches
        if (this.queue.length > 0) {
          const delay = this.calculateBatchDelay();
          if (delay > 0) {
            await this.delay(delay);
          }
        }
      }
    } finally {
      this.isProcessing = false;
      console.debug("Parallel processing completed");
    }
  }

  private getEffectiveConcurrency(): number {
    const stats = this.performanceMonitor.getPerformanceStats();
    
    // Reduce concurrency based on performance
    if (this.performanceMonitor.shouldRateLimit()) {
      return 1; // Serial processing during rate limiting
    }
    
    if (stats.successRate < 0.7) {
      return Math.max(1, Math.floor(this.maxConcurrency / 2)); // Half concurrency for poor performance
    }
    
    if (stats.successRate < 0.9) {
      return Math.max(1, Math.floor(this.maxConcurrency * 0.75)); // Reduced concurrency
    }

    return this.maxConcurrency;
  }

  private calculateBatchDelay(): number {
    const adaptiveDelay = this.performanceMonitor.calculateAdaptiveDelay();
    
    // For parallel processing, we use shorter delays between batches
    // since multiple requests are running concurrently
    const batchDelay = Math.max(50, adaptiveDelay / 3);
    
    if (this.performanceMonitor.shouldRateLimit()) {
      return batchDelay * 2; // Longer delay during rate limiting
    }
    
    return batchDelay;
  }

  private async processAffordanceWithRetry(affordance: AffordanceEntity, maxRetries: number = 3): Promise<void> {
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      const metric = this.performanceMonitor.startRequest(affordance.getLink(), retryCount);
      
      try {
        await affordance.collectInfo();
        this.performanceMonitor.endRequest(metric, true);
        return; // Success, exit retry loop
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.performanceMonitor.endRequest(metric, false, errorMessage);
        
        if (retryCount < maxRetries) {
          const retryDelay = this.performanceMonitor.getRetryDelay(retryCount);
          console.debug(`Retrying affordance ${affordance.getLink()} (${retryCount + 1}/${maxRetries}) after ${retryDelay.toFixed(0)}ms delay`);
          await this.delay(retryDelay);
          retryCount++;
        } else {
          console.error(`Failed to collect info for ${affordance.getLink()} after ${maxRetries} retries:`, errorMessage);
          // Don't throw - allow other parallel requests to continue
          return;
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): { 
    queueSize: number; 
    activeRequests: number; 
    effectiveConcurrency: number;
    isProcessing: boolean;
  } {
    return {
      queueSize: this.queue.length,
      activeRequests: this.activeRequests.size,
      effectiveConcurrency: this.getEffectiveConcurrency(),
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return this.performanceMonitor.getPerformanceStats();
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics(): void {
    this.performanceMonitor.reset();
  }

  /**
   * Update max concurrency (useful for dynamic adjustment)
   */
  setMaxConcurrency(maxConcurrency: number): void {
    this.maxConcurrency = Math.max(1, Math.min(maxConcurrency, 8));
    console.debug(`Max concurrency updated to: ${this.maxConcurrency}`);
  }

  /**
   * Wait for all pending requests to complete
   */
  async waitForCompletion(): Promise<void> {
    while (this.isProcessing || this.activeRequests.size > 0) {
      await this.delay(100);
    }
  }
}
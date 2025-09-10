import AffordanceEntity from "./AffordanceEntity";
import { SmartBackoffStrategy } from "./SmartBackoffStrategy";

export default class CollectingScheduler {
  schedule: any[];
  private backoffStrategy: SmartBackoffStrategy;
  private performanceMetrics: {
    totalProcessed: number;
    totalErrors: number;
    averageProcessingTime: number;
    startTime: number;
  };

  constructor() {
    // console.log("Collecting Scheduler initialised with smart backoff");
    this.schedule = [];
    this.backoffStrategy = new SmartBackoffStrategy();
    this.performanceMetrics = {
      totalProcessed: 0,
      totalErrors: 0,
      averageProcessingTime: 0,
      startTime: Date.now()
    };
  }

  async queueAffordance(affordance: AffordanceEntity) {
    this.schedule.push(affordance);
    // console.log("Affordance queued: ", affordance);
    if (this.schedule.length === 1) {
      // only restart scheduler if it was empty before
      this.queueNextInSchedule();
    }
  }

  async queueNextInSchedule() {
    if (this.schedule.length === 0) {
      // console.log("no affordances left in schedule");
      return; // this stops the scheduler
    }
    
    try {
      const ae = this.schedule.shift();
      const url = ae.getLink();
      const domain = SmartBackoffStrategy.extractDomain(url);
      
      // Calculate smart delay based on performance metrics
      const delay = this.backoffStrategy.calculateDelay(domain);
      
      setTimeout(async () => {
        const startTime = Date.now();
        
        try {
          await ae.collectInfo();
          
          // Record successful processing
          const processingTime = Date.now() - startTime;
          this.backoffStrategy.recordSuccess(processingTime, domain);
          this.updatePerformanceMetrics(processingTime, false);
          
        } catch (error) {
          // Record failure for backoff strategy
          this.backoffStrategy.recordFailure(error, domain);
          this.updatePerformanceMetrics(Date.now() - startTime, true);
          
          // console.log("Error collecting info from affordance: ", error);
          
          // Retry logic with smart backoff
          if (this.backoffStrategy.shouldRetry(domain)) {
            // Re-queue the affordance for retry
            this.schedule.unshift(ae);
          }
        }
        
        this.queueNextInSchedule();
      }, delay);
      
    } catch (error) {
      // console.log("Unexpected error: ", error);
      this.updatePerformanceMetrics(0, true);
      this.queueNextInSchedule();
    }
  }

  private updatePerformanceMetrics(processingTime: number, isError: boolean): void {
    this.performanceMetrics.totalProcessed++;
    
    if (isError) {
      this.performanceMetrics.totalErrors++;
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
   * Get current performance metrics for monitoring
   */
  getPerformanceMetrics(): any {
    const runTime = Date.now() - this.performanceMetrics.startTime;
    const throughput = this.performanceMetrics.totalProcessed / (runTime / 1000); // requests per second
    
    return {
      ...this.performanceMetrics,
      runTime,
      throughput,
      errorRate: this.performanceMetrics.totalErrors / Math.max(this.performanceMetrics.totalProcessed, 1),
      queueLength: this.schedule.length
    };
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
      startTime: Date.now()
    };
  }
}

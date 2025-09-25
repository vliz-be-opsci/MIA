import AffordanceEntity from "./AffordanceEntity";
import PerformanceMonitor, { RequestMetrics } from "./PerformanceMonitor";
import { ICollectingScheduler } from "./SchedulerFactory";

export default class CollectingScheduler implements ICollectingScheduler {
  schedule: any[];
  private performanceMonitor: PerformanceMonitor;
  private isProcessing: boolean = false;

  constructor() {
    // console.debug("Collecting Scheduler initialised");
    this.schedule = [];
    this.performanceMonitor = new PerformanceMonitor();
  }

  async queueAffordance(affordance: AffordanceEntity) {
    this.schedule.push(affordance);
    // console.debug("Affordance queued: ", affordance);
    if (!this.isProcessing) {
      // only restart scheduler if it's not already processing
      this.processNextInSchedule();
    }
  }

  /**
   * Queue affordance with high priority, moving it to front of queue
   * and cancelling any existing requests for the same link
   */
  async prioritizeAffordance(affordance: AffordanceEntity) {
    const link = affordance.getLink();
    
    // Remove any existing entries for the same link
    this.schedule = this.schedule.filter(item => item.getLink() !== link);
    
    // Add to front of queue for immediate processing
    this.schedule.unshift(affordance);
    
    // console.debug("Affordance prioritized: ", affordance);
    if (!this.isProcessing) {
      this.processNextInSchedule();
    }
  }

  private async processNextInSchedule() {
    if (this.isProcessing || this.schedule.length === 0) {
      // console.debug("scheduler already processing or no affordances left");
      return;
    }

    this.isProcessing = true;

    try {
      // Calculate adaptive delay based on performance
      const adaptiveDelay = this.performanceMonitor.calculateAdaptiveDelay();
      
      // Check if we should rate limit
      if (this.performanceMonitor.shouldRateLimit()) {
        console.warn("Rate limiting active, extending delay");
        await this.delay(adaptiveDelay * 2); // Double delay during rate limiting
      } else {
        await this.delay(adaptiveDelay);
      }

      // Process the next affordance
      const ae = this.schedule.shift();
      if (ae) {
        await this.processAffordanceWithRetry(ae);
      }

      this.isProcessing = false;

      // Continue processing if there are more items
      if (this.schedule.length > 0) {
        this.processNextInSchedule();
      }
    } catch (error) {
      console.error("Unexpected error in scheduler: ", error);
      this.isProcessing = false;
      
      // Continue processing even after error
      if (this.schedule.length > 0) {
        this.processNextInSchedule();
      }
    }
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
          console.debug(`Retrying affordance (${retryCount + 1}/${maxRetries}) after ${retryDelay.toFixed(0)}ms delay`);
          await this.delay(retryDelay);
          retryCount++;
        } else {
          console.error(`Failed to collect info after ${maxRetries} retries:`, errorMessage);
          throw error; // Re-throw after exhausting retries
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Legacy method name for backward compatibility
   * @deprecated Use processNextInSchedule instead
   */
  async queueNextInSchedule() {
    console.warn("queueNextInSchedule is deprecated, use processNextInSchedule");
    return this.processNextInSchedule();
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
  resetPerformanceMetrics() {
    this.performanceMonitor.reset();
  }
}

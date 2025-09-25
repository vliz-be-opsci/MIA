import AffordanceEntity from "./AffordanceEntity";
import CollectingScheduler from "./CollectingScheduler";
import ParallelCollectingScheduler from "./ParallelCollectingScheduler";

/**
 * Interface for data collection schedulers
 */
export interface ICollectingScheduler {
  queueAffordance(affordance: AffordanceEntity): Promise<void>;
  prioritizeAffordance?(affordance: AffordanceEntity): Promise<void>;
  getPerformanceStats?(): any;
  resetPerformanceMetrics?(): void;
}

/**
 * Configuration for scheduler behavior
 */
export interface SchedulerConfig {
  type: 'sequential' | 'parallel';
  maxConcurrency?: number; // Only applies to parallel scheduler
  enablePerformanceMonitoring?: boolean;
}

/**
 * Factory for creating appropriate data collection schedulers
 */
export default class SchedulerFactory {
  /**
   * Create a scheduler based on configuration
   */
  static createScheduler(config: SchedulerConfig): ICollectingScheduler {
    const defaultConfig: Required<SchedulerConfig> = {
      maxConcurrency: 3,
      enablePerformanceMonitoring: true,
      ...config
    };

    console.debug(`Creating ${config.type} scheduler with config:`, defaultConfig);

    switch (config.type) {
      case 'parallel':
        return new ParallelCollectingScheduler(defaultConfig.maxConcurrency);
      
      case 'sequential':
      default:
        return new CollectingScheduler();
    }
  }

  /**
   * Create scheduler based on browser capabilities and environment
   */
  static createOptimalScheduler(): ICollectingScheduler {
    // Detect browser capabilities and optimize scheduler choice
    const canUseParallel = this.canUseParallelProcessing();
    const connectionType = this.detectConnectionType();
    
    if (canUseParallel && connectionType !== 'slow') {
      console.debug("Creating parallel scheduler for optimal performance");
      return this.createScheduler({
        type: 'parallel',
        maxConcurrency: this.getOptimalConcurrency(connectionType),
        enablePerformanceMonitoring: true
      });
    } else {
      console.debug("Creating sequential scheduler for compatibility/performance");
      return this.createScheduler({
        type: 'sequential',
        enablePerformanceMonitoring: true
      });
    }
  }

  /**
   * Check if browser supports parallel processing features
   */
  private static canUseParallelProcessing(): boolean {
    // Check for modern browser features needed for parallel processing
    return typeof Promise !== 'undefined' && 
           typeof Promise.race !== 'undefined' && 
           typeof Set !== 'undefined' &&
           typeof performance !== 'undefined' &&
           typeof performance.now !== 'undefined';
  }

  /**
   * Detect connection type for optimization
   */
  private static detectConnectionType(): 'fast' | 'slow' | 'unknown' {
    // Use Network Information API if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === '4g' || effectiveType === '3g') {
        return 'fast';
      } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        return 'slow';
      }
    }
    
    // Fallback: assume reasonable connection
    return 'unknown';
  }

  /**
   * Get optimal concurrency based on connection type
   */
  private static getOptimalConcurrency(connectionType: 'fast' | 'slow' | 'unknown'): number {
    switch (connectionType) {
      case 'fast':
        return 5; // Higher concurrency for fast connections
      case 'slow':
        return 2; // Lower concurrency for slow connections
      case 'unknown':
      default:
        return 3; // Conservative default
    }
  }
}
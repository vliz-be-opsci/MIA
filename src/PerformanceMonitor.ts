/**
 * Performance monitoring and adaptive delay management for data collection
 */
export interface RequestMetrics {
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  retryCount: number;
  error?: string;
}

export interface PerformanceStats {
  averageResponseTime: number;
  successRate: number;
  failureRate: number;
  totalRequests: number;
  recentFailures: number;
}

export default class PerformanceMonitor {
  private metrics: RequestMetrics[] = [];
  private readonly maxMetricsHistory = 100;
  private readonly recentFailureWindow = 10; // Consider last 10 requests for failure rate

  constructor() {
    console.log("Performance Monitor initialized");
  }

  startRequest(url: string, retryCount: number = 0): RequestMetrics {
    const metric: RequestMetrics = {
      url,
      startTime: performance.now(),
      success: false,
      retryCount,
    };
    return metric;
  }

  endRequest(metric: RequestMetrics, success: boolean, error?: string): void {
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.error = error;

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    console.log(`Request completed: ${metric.url} in ${metric.duration?.toFixed(2)}ms, success: ${success}`);
  }

  getPerformanceStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 1000, // Default 1s
        successRate: 1.0,
        failureRate: 0.0,
        totalRequests: 0,
        recentFailures: 0,
      };
    }

    const successfulRequests = this.metrics.filter(m => m.success && m.duration !== undefined);
    const totalRequests = this.metrics.length;
    const successCount = successfulRequests.length;
    const failureCount = totalRequests - successCount;

    // Calculate recent failures (last N requests)
    const recentMetrics = this.metrics.slice(-this.recentFailureWindow);
    const recentFailures = recentMetrics.filter(m => !m.success).length;

    const averageResponseTime = successfulRequests.length > 0
      ? successfulRequests.reduce((sum, m) => sum + (m.duration || 0), 0) / successfulRequests.length
      : 1000; // Default 1s if no successful requests

    return {
      averageResponseTime,
      successRate: totalRequests > 0 ? successCount / totalRequests : 1.0,
      failureRate: totalRequests > 0 ? failureCount / totalRequests : 0.0,
      totalRequests,
      recentFailures,
    };
  }

  /**
   * Calculate adaptive delay based on recent performance
   */
  calculateAdaptiveDelay(): number {
    const stats = this.getPerformanceStats();
    const baseDelay = 100; // Minimum delay in ms
    const maxDelay = 5000; // Maximum delay in ms

    // Factors affecting delay:
    // 1. Average response time - longer responses need more spacing
    // 2. Recent failure rate - more failures need exponential backoff
    // 3. Success rate - lower success rate increases delay

    let adaptiveDelay = baseDelay;

    // Factor 1: Base delay on average response time
    adaptiveDelay += Math.min(stats.averageResponseTime * 0.5, 2000);

    // Factor 2: Exponential backoff for recent failures
    if (stats.recentFailures > 0) {
      const backoffMultiplier = Math.pow(2, Math.min(stats.recentFailures, 5)); // Cap at 2^5 = 32
      adaptiveDelay *= backoffMultiplier;
    }

    // Factor 3: Penalty for low success rate
    if (stats.successRate < 0.8) {
      const penaltyMultiplier = 1 / Math.max(stats.successRate, 0.1);
      adaptiveDelay *= penaltyMultiplier;
    }

    // Ensure delay is within reasonable bounds
    adaptiveDelay = Math.max(baseDelay, Math.min(adaptiveDelay, maxDelay));

    console.log(`Adaptive delay calculated: ${adaptiveDelay.toFixed(0)}ms (avg response: ${stats.averageResponseTime.toFixed(0)}ms, recent failures: ${stats.recentFailures}, success rate: ${(stats.successRate * 100).toFixed(1)}%)`);

    return adaptiveDelay;
  }

  /**
   * Determine if system should implement rate limiting
   */
  shouldRateLimit(): boolean {
    const stats = this.getPerformanceStats();
    
    // Rate limit if we have recent consecutive failures
    if (stats.recentFailures >= 3) {
      console.warn("Rate limiting activated due to recent failures");
      return true;
    }

    // Rate limit if success rate is very low
    if (stats.totalRequests > 5 && stats.successRate < 0.5) {
      console.warn("Rate limiting activated due to low success rate");
      return true;
    }

    return false;
  }

  /**
   * Get suggested retry delay for failed requests
   */
  getRetryDelay(retryCount: number): number {
    const baseRetryDelay = 1000; // 1 second base
    const maxRetryDelay = 30000; // 30 seconds max

    // Exponential backoff: delay = base * 2^retryCount
    const delay = Math.min(baseRetryDelay * Math.pow(2, retryCount), maxRetryDelay);
    
    // Add some jitter to avoid thundering herd
    const jitter = Math.random() * 0.3 * delay; // ±30% jitter
    
    return delay + jitter;
  }

  /**
   * Clear metrics (useful for testing or reset)
   */
  reset(): void {
    this.metrics = [];
    console.log("Performance Monitor reset");
  }
}
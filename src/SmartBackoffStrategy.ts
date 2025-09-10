// Smart backoff strategy for adaptive request timing and retry logic
export interface BackoffMetrics {
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  lastRequestTime: number;
  consecutiveFailures: number;
  rateLimitDetected: boolean;
}

export interface BackoffConfig {
  minDelay: number;           // Minimum delay between requests (ms)
  maxDelay: number;           // Maximum delay between requests (ms)
  baseDelay: number;          // Base delay for calculations (ms)
  backoffMultiplier: number;  // Multiplier for exponential backoff
  maxRetries: number;         // Maximum number of retries
  responseTimeThreshold: number; // Response time threshold for adapting delays (ms)
  rateLimitThreshold: number; // Consecutive failures to detect rate limiting
}

export class SmartBackoffStrategy {
  private metrics: Map<string, BackoffMetrics> = new Map();
  private config: BackoffConfig;

  constructor(config?: Partial<BackoffConfig>) {
    this.config = {
      minDelay: 100,
      maxDelay: 10000,
      baseDelay: 666,
      backoffMultiplier: 1.5,
      maxRetries: 3,
      responseTimeThreshold: 2000,
      rateLimitThreshold: 3,
      ...config
    };
  }

  /**
   * Calculate the optimal delay before the next request
   */
  calculateDelay(domain?: string): number {
    const metrics = this.getMetrics(domain);
    
    // If rate limiting is detected, use exponential backoff
    if (metrics.rateLimitDetected) {
      return Math.min(
        this.config.baseDelay * Math.pow(this.config.backoffMultiplier, metrics.consecutiveFailures),
        this.config.maxDelay
      );
    }

    // Adaptive delay based on average response time
    let adaptiveDelay = this.config.baseDelay;
    
    if (metrics.averageResponseTime > this.config.responseTimeThreshold) {
      // Slow responses - increase delay
      adaptiveDelay = Math.min(
        this.config.baseDelay * (metrics.averageResponseTime / this.config.responseTimeThreshold),
        this.config.maxDelay
      );
    } else if (metrics.averageResponseTime > 0 && metrics.consecutiveFailures === 0) {
      // Fast responses and no failures - decrease delay
      adaptiveDelay = Math.max(
        this.config.baseDelay * 0.8,
        this.config.minDelay
      );
    }

    return Math.max(adaptiveDelay, this.config.minDelay);
  }

  /**
   * Record a successful request
   */
  recordSuccess(responseTime: number, domain?: string): void {
    const metrics = this.getMetrics(domain);
    
    metrics.successCount++;
    metrics.consecutiveFailures = 0;
    metrics.rateLimitDetected = false;
    metrics.lastRequestTime = Date.now();
    
    // Update rolling average response time
    if (metrics.averageResponseTime === 0) {
      metrics.averageResponseTime = responseTime;
    } else {
      metrics.averageResponseTime = (metrics.averageResponseTime * 0.8) + (responseTime * 0.2);
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(error: any, domain?: string): void {
    const metrics = this.getMetrics(domain);
    
    metrics.failureCount++;
    metrics.consecutiveFailures++;
    metrics.lastRequestTime = Date.now();
    
    // Detect rate limiting
    if (metrics.consecutiveFailures >= this.config.rateLimitThreshold) {
      metrics.rateLimitDetected = true;
    }

    // Check for specific rate limiting indicators
    if (this.isRateLimitError(error)) {
      metrics.rateLimitDetected = true;
    }
  }

  /**
   * Check if a retry should be attempted
   */
  shouldRetry(domain?: string): boolean {
    const metrics = this.getMetrics(domain);
    return metrics.consecutiveFailures < this.config.maxRetries;
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics(domain?: string): BackoffMetrics {
    return { ...this.getMetrics(domain) };
  }

  /**
   * Reset metrics for a domain
   */
  resetMetrics(domain?: string): void {
    const key = domain || 'default';
    this.metrics.delete(key);
  }

  private getMetrics(domain?: string): BackoffMetrics {
    const key = domain || 'default';
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        successCount: 0,
        failureCount: 0,
        averageResponseTime: 0,
        lastRequestTime: 0,
        consecutiveFailures: 0,
        rateLimitDetected: false
      });
    }
    
    return this.metrics.get(key)!;
  }

  private isRateLimitError(error: any): boolean {
    // Check for common rate limiting indicators
    if (!error) return false;
    
    const errorMessage = error.message || error.toString().toLowerCase();
    const statusCode = error.status || error.statusCode;
    
    // HTTP status codes that indicate rate limiting
    if (statusCode === 429 || statusCode === 503) {
      return true;
    }
    
    // Common rate limiting error messages
    const rateLimitKeywords = [
      'rate limit',
      'too many requests',
      'throttle',
      'quota exceeded',
      'slow down'
    ];
    
    return rateLimitKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Extract domain from URL for domain-specific metrics
   */
  static extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }
}
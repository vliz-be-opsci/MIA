/**
 * Performance benchmarking utility for comparing scheduler performance
 */
import CollectingScheduler from "./CollectingScheduler";
import ParallelCollectingScheduler from "./ParallelCollectingScheduler";
export interface BenchmarkResult {
  schedulerType: string;
  totalTime: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  successRate: number;
  throughput: number; // requests per second
}

export interface BenchmarkConfig {
  testUrls: string[];
  iterations: number;
  warmupRuns: number;
}

export default class PerformanceBenchmark {
  private testUrls: string[] = [
    "https://marineinfo.org/id/dataset/2198",
    "https://marineinfo.org/id/dataset/2199", 
    "https://marineinfo.org/id/dataset/2200",
    "https://marineregions.org/mrgid/2114",
    "https://marineregions.org/mrgid/2115",
    "https://orcid.org/0000-0000-0000-0000" // This will likely fail, good for testing error handling
  ];

  constructor(private config?: Partial<BenchmarkConfig>) {
    if (config?.testUrls) {
      this.testUrls = config.testUrls;
    }
  }

  /**
   * Run benchmark comparing sequential vs parallel schedulers
   */
  async runComparison(): Promise<{
    sequential: BenchmarkResult;
    parallel: BenchmarkResult;
    improvement: {
      timeReduction: number;
      throughputIncrease: number;
    };
  }> {
    console.log("Starting performance benchmark comparison...");

    // Run benchmarks
    const sequentialResult = await this.benchmarkScheduler(
      new CollectingScheduler(),
      "Sequential"
    );
    
    const parallelResult = await this.benchmarkScheduler(
      new ParallelCollectingScheduler(3),
      "Parallel"
    );

    // Calculate improvements
    const timeReduction = ((sequentialResult.totalTime - parallelResult.totalTime) / sequentialResult.totalTime) * 100;
    const throughputIncrease = ((parallelResult.throughput - sequentialResult.throughput) / sequentialResult.throughput) * 100;

    const results = {
      sequential: sequentialResult,
      parallel: parallelResult,
      improvement: {
        timeReduction,
        throughputIncrease
      }
    };

    this.logResults(results);
    return results;
  }

  private async benchmarkScheduler(scheduler: any, schedulerType: string): Promise<BenchmarkResult> {
    console.log(`Benchmarking ${schedulerType} scheduler...`);
    
    const iterations = this.config?.iterations ?? 3;
    const warmupRuns = this.config?.warmupRuns ?? 1;
    
    // Warm up runs (not counted in results)
    for (let i = 0; i < warmupRuns; i++) {
      console.log(`Warmup run ${i + 1}/${warmupRuns} for ${schedulerType}`);
      await this.runSingleBenchmark(scheduler, false);
      await this.delay(1000); // Wait between runs
    }

    // Actual benchmark runs
    const results: BenchmarkResult[] = [];
    for (let i = 0; i < iterations; i++) {
      console.log(`Benchmark run ${i + 1}/${iterations} for ${schedulerType}`);
      const result = await this.runSingleBenchmark(scheduler, true);
      results.push(result);
      
      if (i < iterations - 1) {
        await this.delay(2000); // Wait between benchmark runs
      }
    }

    // Calculate averages
    return this.calculateAverageResult(results, schedulerType);
  }

  private async runSingleBenchmark(scheduler: any, recordMetrics: boolean): Promise<BenchmarkResult> {
    const startTime = performance.now();
    let successCount = 0;
    let failCount = 0;

    // Reset performance metrics if available
    if (scheduler.resetPerformanceMetrics) {
      scheduler.resetPerformanceMetrics();
    }

    // Create mock affordance entities for testing
    const mockAffordances = this.testUrls.map(url => this.createMockAffordance(url));
    
    // Queue all affordances
    const queuePromises = mockAffordances.map(affordance => 
      scheduler.queueAffordance(affordance)
    );

    try {
      // Wait for all to be queued
      await Promise.all(queuePromises);
      
      // Wait for processing to complete
      if (scheduler.waitForCompletion) {
        await scheduler.waitForCompletion();
      } else {
        // For sequential scheduler, wait a reasonable time
        await this.delay(10000);
      }

      // Get performance stats if available
      let performanceStats = null;
      if (scheduler.getPerformanceStats) {
        performanceStats = scheduler.getPerformanceStats();
        successCount = performanceStats.totalRequests - (performanceStats.totalRequests * performanceStats.failureRate);
        failCount = performanceStats.totalRequests * performanceStats.failureRate;
      } else {
        // Fallback for schedulers without performance monitoring
        successCount = this.testUrls.length;
        failCount = 0;
      }

    } catch (error) {
      console.error("Benchmark run failed:", error);
      failCount = this.testUrls.length;
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    if (!recordMetrics) {
      return {
        schedulerType: "warmup",
        totalTime: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        successRate: 0,
        throughput: 0
      };
    }

    const totalRequests = successCount + failCount;
    const successRate = totalRequests > 0 ? successCount / totalRequests : 0;
    const throughput = totalRequests > 0 ? (totalRequests / (totalTime / 1000)) : 0;

    let averageResponseTime = 0;
    if (scheduler.getPerformanceStats) {
      const stats = scheduler.getPerformanceStats();
      averageResponseTime = stats.averageResponseTime || 0;
    }

    return {
      schedulerType: scheduler.constructor.name,
      totalTime,
      successfulRequests: successCount,
      failedRequests: failCount,
      averageResponseTime,
      successRate,
      throughput
    };
  }

  private createMockAffordance(url: string): any {
    return {
      getLink: () => url,
      collectInfo: async () => {
        // Mock data collection with random delay to simulate real conditions
        const delay = Math.random() * 1000 + 500; // 500-1500ms
        await this.delay(delay);
        
        // Simulate occasional failures
        if (Math.random() < 0.1) { // 10% failure rate
          throw new Error(`Mock collection failed for ${url}`);
        }
        
        return { mockData: true };
      }
    };
  }

  private calculateAverageResult(results: BenchmarkResult[], schedulerType: string): BenchmarkResult {
    const avgResult: BenchmarkResult = {
      schedulerType,
      totalTime: results.reduce((sum, r) => sum + r.totalTime, 0) / results.length,
      successfulRequests: results.reduce((sum, r) => sum + r.successfulRequests, 0) / results.length,
      failedRequests: results.reduce((sum, r) => sum + r.failedRequests, 0) / results.length,
      averageResponseTime: results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length,
      successRate: results.reduce((sum, r) => sum + r.successRate, 0) / results.length,
      throughput: results.reduce((sum, r) => sum + r.throughput, 0) / results.length
    };

    return avgResult;
  }

  private logResults(results: any): void {
    console.log("\n" + "=".repeat(60));
    console.log("PERFORMANCE BENCHMARK RESULTS");
    console.log("=".repeat(60));
    
    console.log("\nSequential Scheduler:");
    console.log(`  Total Time: ${results.sequential.totalTime.toFixed(2)}ms`);
    console.log(`  Success Rate: ${(results.sequential.successRate * 100).toFixed(1)}%`);
    console.log(`  Throughput: ${results.sequential.throughput.toFixed(2)} req/s`);
    console.log(`  Avg Response Time: ${results.sequential.averageResponseTime.toFixed(2)}ms`);
    
    console.log("\nParallel Scheduler:");
    console.log(`  Total Time: ${results.parallel.totalTime.toFixed(2)}ms`);
    console.log(`  Success Rate: ${(results.parallel.successRate * 100).toFixed(1)}%`);
    console.log(`  Throughput: ${results.parallel.throughput.toFixed(2)} req/s`);
    console.log(`  Avg Response Time: ${results.parallel.averageResponseTime.toFixed(2)}ms`);
    
    console.log("\nPerformance Improvement:");
    console.log(`  Time Reduction: ${results.improvement.timeReduction.toFixed(1)}%`);
    console.log(`  Throughput Increase: ${results.improvement.throughputIncrease.toFixed(1)}%`);
    
    console.log("\n" + "=".repeat(60));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
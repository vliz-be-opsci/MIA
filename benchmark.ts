/**
 * Benchmark utilities for MIA performance testing
 * Import this script separately to run performance benchmarks
 */
import PerformanceBenchmark from "./src/PerformanceBenchmark";

// Expose benchmark functionality to window
(window as any).runPerformanceBenchmark = async () => {
  const benchmark = new PerformanceBenchmark();
  return await benchmark.runComparison();
};

console.log("MIA Performance Benchmark utilities loaded. Use window.runPerformanceBenchmark() to test.");
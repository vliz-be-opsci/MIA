# MIA Performance Improvements

This document describes the performance improvements implemented for the MIA (Marine Info Affordances) data collection system.

## Overview

The MIA system has been enhanced with smart backoff strategies, parallel processing, and comprehensive performance monitoring to significantly improve data collection performance while maintaining reliability.

## Key Features

### 1. Smart Backoff Strategy

The system now uses adaptive delays instead of fixed timing:

- **Adaptive Delays**: Delay calculation based on recent response times and success rates
- **Exponential Backoff**: Failed requests use exponential backoff with jitter
- **Rate Limiting Detection**: Automatic detection and response to server rate limiting
- **Performance-Aware Timing**: Faster processing for responsive servers, slower for overloaded ones

### 2. Parallel Processing

New parallel scheduler with intelligent concurrency management:

- **Configurable Concurrency**: Control maximum parallel requests (1-8)
- **Dynamic Throttling**: Automatically reduces concurrency during poor performance
- **Batch Processing**: Efficient batching of requests with adaptive inter-batch delays
- **Promise-Based Architecture**: Modern async/await implementation for better resource management

### 3. Performance Monitoring

Comprehensive monitoring and metrics collection:

- **Request Metrics**: Track response times, success rates, and failure patterns
- **Real-Time Analytics**: Live performance statistics and adaptive behavior
- **Historical Data**: Maintain metrics history for trend analysis
- **Debug Interface**: Browser console access to performance data

## Configuration

### HTML Configuration

Add these data attributes to your MIA script tag:

```html
<script 
  id="mia_script" 
  src="path/to/mia.bundle.js"
  data-deref-config="path/to/config.json"
  data-scheduler-type="parallel"
  data-max-concurrency="5">
</script>
```

#### Available Options

- `data-scheduler-type`: Choose between `sequential` or `parallel`
- `data-max-concurrency`: Set maximum concurrent requests (1-8, default: 3)

### Auto-Detection Mode

If no scheduler type is specified, MIA will automatically select the optimal scheduler based on:

- Browser capabilities (Promise support, performance API)
- Network connection type (when available via Network Information API)
- Device performance characteristics

## Performance Monitoring

### Browser Console Interface

Access performance data through the browser console:

```javascript
// Get current performance statistics
window.getPerformanceStats()

// Reset performance metrics
window.resetPerformanceMetrics()

// Run performance benchmark (advanced usage)
// Note: Import the benchmark module in console:
import('./src/PerformanceBenchmark.js').then(m => new m.default().runComparison())
```

### Performance Metrics

The system tracks these key metrics:

- **Average Response Time**: Mean time for successful requests
- **Success Rate**: Percentage of successful requests
- **Failure Rate**: Percentage of failed requests
- **Recent Failures**: Count of failures in recent request window
- **Total Requests**: Total number of requests processed

## Benchmark Results

Use the built-in benchmark tool to compare performance via browser console:

```javascript
// Import and run benchmark
import('./src/PerformanceBenchmark.js').then(module => {
  const benchmark = new module.default();
  return benchmark.runComparison();
}).then(results => {
  console.log("Sequential:", results.sequential);
  console.log("Parallel:", results.parallel);
  console.log("Improvement:", results.improvement);
});
```

Expected improvements with parallel processing:
- **Time Reduction**: 40-70% faster completion times
- **Throughput Increase**: 2-4x higher requests per second
- **Better Resilience**: Improved handling of slow or failing endpoints

## Adaptive Behavior

The system automatically adjusts its behavior based on performance:

### High Performance Conditions
- Maintains maximum configured concurrency
- Uses shorter delays between requests
- Processes requests aggressively

### Poor Performance Conditions
- Reduces concurrency to prevent overwhelming servers
- Implements longer delays and backoff
- Switches to more conservative processing

### Failure Recovery
- Exponential backoff for failed requests (up to 30 seconds)
- Rate limiting detection and response
- Automatic retry with intelligent delay calculation

## Backward Compatibility

All changes are backward compatible:
- Existing configurations continue to work
- Default behavior maintains original functionality
- Performance improvements are opt-in via configuration

## Developer Guidelines

### Debugging Performance Issues

1. **Monitor Console Logs**: Performance information is logged to console
2. **Check Performance Stats**: Use `window.getPerformanceStats()` for real-time data
3. **Run Benchmarks**: Use `window.runPerformanceBenchmark()` to compare schedulers
4. **Adjust Configuration**: Modify concurrency and scheduler type as needed

### Best Practices

1. **Start Conservative**: Begin with parallel scheduler and concurrency of 3
2. **Monitor Performance**: Watch success rates and response times
3. **Adjust Gradually**: Increase concurrency only if performance improves
4. **Consider Server Limits**: Respect target server capacity and rate limits

### Troubleshooting

| Issue | Solution |
|-------|----------|
| High failure rate | Reduce concurrency or switch to sequential |
| Slow response times | Check network connection and server performance |
| Rate limiting errors | System auto-detects, but verify delay settings |
| Memory issues | Reduce concurrency for resource-constrained devices |

## Technical Implementation

### Architecture Overview

```
AffordanceManager
├── SchedulerFactory (creates appropriate scheduler)
├── CollectingScheduler (sequential processing)
├── ParallelCollectingScheduler (parallel processing)
└── PerformanceMonitor (metrics and adaptive behavior)
```

### Key Classes

- **PerformanceMonitor**: Tracks metrics and calculates adaptive delays
- **SchedulerFactory**: Creates optimal scheduler based on configuration/detection
- **ParallelCollectingScheduler**: Manages concurrent request processing
- **CollectingScheduler**: Enhanced sequential processing with smart delays

## Future Enhancements

Planned improvements for future versions:

1. **Web Workers Integration**: True multithreading when RDF libraries support it
2. **Advanced Caching**: Intelligent caching strategies for repeated requests
3. **Request Batching**: Combine multiple requests where possible
4. **Streaming Responses**: Process partial responses as they arrive
5. **Machine Learning**: AI-driven performance optimization

## Support

For questions or issues related to performance improvements:

1. Check browser console for detailed logging
2. Use benchmark tools to identify bottlenecks
3. Review network conditions and target server performance
4. Consider adjusting configuration based on specific use case
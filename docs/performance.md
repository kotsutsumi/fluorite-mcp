# Performance Guide

A comprehensive guide to optimizing, monitoring, and troubleshooting performance in Fluorite MCP.

## Overview

Fluorite MCP is designed for high-performance operations with built-in monitoring, optimization features, and enterprise-grade scalability. This guide covers performance characteristics, optimization strategies, and best practices for production deployment.

## Performance Characteristics

### Core Performance Metrics

| Metric | Target | Excellent | Good | Needs Attention |
|--------|--------|-----------|------|-----------------|
| **Response Time** | <100ms | <50ms | <100ms | >200ms |
| **Memory Usage** | <50MB | <25MB | <50MB | >100MB |
| **Startup Time** | <2s | <1s | <2s | >5s |
| **Throughput** | >1000 ops/min | >2000 ops/min | >1000 ops/min | <500 ops/min |
| **Error Rate** | <0.1% | <0.01% | <0.1% | >1% |

### Framework-Specific Performance

#### Static Analysis Performance
- **TypeScript Analysis**: ~50ms per file
- **React Component Analysis**: ~30ms per component
- **Next.js Route Analysis**: ~20ms per route
- **Vue Component Analysis**: ~40ms per component

#### Catalog Operations Performance
- **Spec Lookup**: <10ms (cached), <50ms (disk)
- **Spec Writing**: ~20ms per operation
- **List Operations**: <30ms for <100 specs
- **Search Operations**: <100ms across 87+ specs

## Built-in Performance Monitoring

### Performance Monitor

Fluorite MCP includes a comprehensive performance monitoring system:

```typescript
// Automatic operation timing
logger.time('operation-name', async () => {
  // Your operation here
});

// Manual performance recording
performanceMonitor.recordOperation('custom-op', duration);

// Get performance metrics
const metrics = performanceMonitor.getMetrics();
```

### Real-time Metrics

Access real-time performance data through the `server-metrics` tool:

```bash
# Via CLI
fluorite-mcp --server-metrics

# Via MCP protocol
{
  "method": "tools/call",
  "params": {
    "name": "server-metrics"
  }
}
```

**Sample Output:**
```json
{
  "uptime": 3600000,
  "operationCount": 1250,
  "errorCount": 2,
  "errorRate": 0.0016,
  "memory": {
    "heapUsed": 45.2,
    "heapTotal": 67.8,
    "external": 12.3,
    "rss": 89.1
  },
  "performanceMetrics": {
    "avg": 45.2,
    "max": 180,
    "min": 12,
    "count": 1250
  }
}
```

### Performance Testing

Run comprehensive performance tests:

```bash
# Built-in performance test
fluorite-mcp --performance-test

# Via MCP protocol
{
  "method": "tools/call",
  "params": {
    "name": "performance-test"
  }
}
```

**Performance Test Coverage:**
- Catalog operations (read/write/list)
- Memory leak detection
- Concurrent operation handling
- Error recovery performance
- Static analysis throughput

## Optimization Strategies

### 1. Memory Optimization

#### Monitoring Memory Usage
```typescript
// Get current memory usage
const metrics = logger.getMetrics();
console.log(`Memory usage: ${metrics.memory.heapUsed}MB`);

// Performance threshold monitoring
if (metrics.memory.heapUsed > 100) {
  logger.warn('High memory usage detected', { 
    usage: metrics.memory.heapUsed 
  });
}
```

#### Memory Optimization Techniques
- **Lazy Loading**: Specs are loaded on-demand
- **Garbage Collection**: Automatic cleanup of unused resources
- **Stream Processing**: Large files processed in chunks
- **Cache Management**: LRU cache for frequently accessed specs

### 2. I/O Optimization

#### File System Operations
```typescript
// Batch file operations
const batchSize = 10;
const files = await Promise.all(
  batch.map(file => readSpec(file, config))
);

// Async file operations
const content = await fs.readFile(path, 'utf8');
```

#### Caching Strategy
- **In-Memory Cache**: Frequently accessed specs
- **Disk Cache**: Parsed content for complex operations
- **Version-Aware**: Cache invalidation on content changes

### 3. Static Analysis Optimization

#### Performance Configuration
```typescript
const analyzerConfig = {
  maxIssues: 100,           // Limit issue detection
  enabledRules: ['critical'], // Focus on critical rules
  strictMode: false,        // Reduce processing overhead
  targetFiles: ['src/**']   // Limit analysis scope
};
```

#### Framework-Specific Optimization
- **React**: Component-level analysis caching
- **Next.js**: Route-based optimization
- **TypeScript**: Incremental type checking
- **Vue**: Template compilation caching

### 4. Concurrent Operations

#### Connection Pool Management
```typescript
// Configure concurrent operations
const config = {
  maxConcurrentOperations: 10,
  operationTimeout: 30000,
  retryAttempts: 3
};
```

#### Load Balancing
- **Operation Queuing**: Manage concurrent requests
- **Resource Allocation**: Dynamic resource distribution
- **Graceful Degradation**: Fallback strategies under load

## Production Deployment

### Resource Requirements

#### Minimum System Requirements
- **Node.js**: 18.0+ (20.0+ recommended)
- **Memory**: 512MB RAM minimum, 1GB recommended
- **CPU**: 1 core minimum, 2+ cores recommended
- **Disk**: 100MB for installation, 500MB for cache
- **Network**: Reliable internet for library lookups

#### Scaling Guidelines

| Deployment Size | Memory | CPU | Concurrent Users | Specs |
|----------------|--------|-----|------------------|-------|
| **Small** | 1GB | 2 cores | <50 | <100 |
| **Medium** | 2GB | 4 cores | <200 | <500 |
| **Large** | 4GB | 8 cores | <1000 | <1000 |
| **Enterprise** | 8GB+ | 16+ cores | >1000 | >1000 |

### Environment Configuration

#### Performance Environment Variables
```bash
# Logging configuration
FLUORITE_LOG_LEVEL=info           # Reduce log verbosity
FLUORITE_LOG_FORMAT=json          # Structured logging
FLUORITE_LOG_DISABLE=false        # Enable logging

# Performance tuning
NODE_OPTIONS="--max-old-space-size=4096"  # Memory limit
UV_THREADPOOL_SIZE=16              # I/O thread pool size

# Cache configuration
FLUORITE_CATALOG_DIR=/fast/storage # Use SSD for catalog
```

#### Production Optimizations
```bash
# Enable production optimizations
NODE_ENV=production

# Disable debug features
DEBUG=

# Configure process management
pm2 start fluorite-mcp --instances 4 --max-memory-restart 1G
```

### Load Testing

#### Benchmarking Script
```bash
#!/bin/bash
# performance-benchmark.sh

echo "🚀 Starting Fluorite MCP Performance Benchmark"

# Warmup
for i in {1..10}; do
  fluorite-mcp list-specs >/dev/null 2>&1
done

# Throughput test
start_time=$(date +%s%N)
for i in {1..100}; do
  fluorite-mcp list-specs >/dev/null 2>&1 &
done
wait
end_time=$(date +%s%N)

duration=$((($end_time - $start_time) / 1000000))
throughput=$((100 * 1000 / $duration))

echo "✅ Completed 100 operations in ${duration}ms"
echo "📊 Throughput: ${throughput} ops/second"
```

#### Stress Testing
```typescript
// stress-test.ts
import { performance } from 'perf_hooks';

async function stressTest() {
  const operations = 1000;
  const concurrency = 50;
  
  const start = performance.now();
  
  // Run concurrent operations
  const promises = Array.from({ length: operations }, (_, i) => 
    runOperation(i % concurrency)
  );
  
  const results = await Promise.allSettled(promises);
  const end = performance.now();
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log({
    operations,
    duration: end - start,
    successful,
    failed,
    throughput: operations / ((end - start) / 1000)
  });
}
```

## Monitoring and Observability

### Structured Logging

#### Log Levels and Performance Impact
| Level | Impact | Use Case | Performance Cost |
|-------|--------|----------|------------------|
| `trace` | Minimal | Development debugging | High |
| `debug` | Low | Development/staging | Medium |
| `info` | Minimal | Production monitoring | Low |
| `warn` | None | Production alerts | None |
| `error` | None | Error tracking | None |

#### Performance-Focused Logging
```typescript
// Efficient logging patterns
logger.info('Operation completed', {
  operation: 'read-spec',
  duration: 45,
  packageName: pkg,
  performanceMetrics: {
    memoryUsage: process.memoryUsage(),
    responseTime: duration
  }
});
```

### Health Checks

#### Built-in Health Monitoring
```bash
# Quick health check
fluorite-mcp --self-test

# Comprehensive monitoring
fluorite-mcp --server-metrics
```

#### Custom Health Checks
```typescript
// health-check.ts
export async function healthCheck() {
  const start = performance.now();
  
  try {
    // Test basic operations
    await listSpecs();
    const testResult = await runSelfTest();
    const metrics = await getServerMetrics();
    
    const duration = performance.now() - start;
    
    return {
      status: 'healthy',
      duration,
      metrics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

### Alerting

#### Performance Alerts
```yaml
# alerts.yml
alerts:
  - name: "High Memory Usage"
    condition: "memory.heapUsed > 100"
    severity: "warning"
    action: "restart"
  
  - name: "High Error Rate"
    condition: "errorRate > 0.05"
    severity: "critical"
    action: "investigate"
  
  - name: "Slow Response Times"
    condition: "avg_response_time > 200"
    severity: "warning"
    action: "optimize"
```

## Troubleshooting Performance Issues

### Common Performance Problems

#### 1. High Memory Usage
**Symptoms:**
- Memory usage >100MB
- Gradual memory increase over time
- OutOfMemory errors

**Diagnosis:**
```bash
# Check memory usage
fluorite-mcp --server-metrics | grep memory

# Monitor over time
watch -n 5 'fluorite-mcp --server-metrics'
```

**Solutions:**
- Restart service regularly
- Reduce concurrent operations
- Clear cache periodically
- Increase memory allocation

#### 2. Slow Response Times
**Symptoms:**
- Response times >200ms
- Client timeouts
- Decreased throughput

**Diagnosis:**
```bash
# Performance test
fluorite-mcp --performance-test

# Check specific operations
time fluorite-mcp list-specs
```

**Solutions:**
- Enable caching
- Optimize file I/O
- Reduce analysis scope
- Use SSD storage

#### 3. High Error Rates
**Symptoms:**
- Error rate >1%
- Frequent operation failures
- Inconsistent behavior

**Diagnosis:**
```bash
# Check error patterns
grep -i error /var/log/fluorite-mcp.log

# Run diagnostics
fluorite-mcp --self-test
```

**Solutions:**
- Fix file permissions
- Ensure disk space
- Update dependencies
- Restart service

### Performance Debugging

#### Enable Debug Logging
```bash
# Enable detailed performance logging
FLUORITE_LOG_LEVEL=debug fluorite-mcp
DEBUG=fluorite-mcp* fluorite-mcp

# Performance-specific debugging
DEBUG=fluorite-mcp:performance fluorite-mcp
```

#### Profiling Tools
```bash
# Node.js profiling
node --prof dist/mcp-server.js

# Memory profiling
node --inspect dist/mcp-server.js

# CPU profiling
node --cpu-prof dist/mcp-server.js
```

### Performance Optimization Checklist

#### Pre-deployment
- [ ] Run performance tests
- [ ] Configure appropriate memory limits
- [ ] Set up monitoring and alerting
- [ ] Optimize environment variables
- [ ] Test under load

#### Runtime Monitoring
- [ ] Monitor memory usage trends
- [ ] Track response time percentiles
- [ ] Monitor error rates
- [ ] Check disk usage
- [ ] Verify log rotation

#### Regular Maintenance
- [ ] Review performance metrics weekly
- [ ] Clean up old cache files
- [ ] Update to latest version
- [ ] Restart services if memory usage is high
- [ ] Review and optimize static analysis rules

## Advanced Performance Features

### Intelligent Caching

#### Multi-level Cache Strategy
```typescript
// L1: In-memory cache (hot data)
const memoryCache = new Map<string, CacheEntry>();

// L2: Disk cache (warm data)
const diskCache = path.join(config.baseDir, '.cache');

// L3: Network cache (cold data)
const networkCache = 'https://cache.fluorite-mcp.com';
```

#### Cache Configuration
```typescript
const cacheConfig = {
  maxMemoryEntries: 1000,
  maxDiskSize: '100MB',
  ttl: 3600, // 1 hour
  compressionLevel: 6
};
```

### Batch Processing

#### Optimized Batch Operations
```typescript
// Process multiple specs efficiently
async function batchProcessSpecs(packages: string[]) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < packages.length; i += batchSize) {
    const batch = packages.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(pkg => processSpec(pkg))
    );
    results.push(...batchResults);
    
    // Yield control to event loop
    await new Promise(resolve => setImmediate(resolve));
  }
  
  return results;
}
```

### Resource Pool Management

#### Connection Pooling
```typescript
class ResourcePool {
  private resources: Resource[] = [];
  private maxSize = 10;
  private currentSize = 0;
  
  async acquire(): Promise<Resource> {
    if (this.resources.length > 0) {
      return this.resources.pop()!;
    }
    
    if (this.currentSize < this.maxSize) {
      this.currentSize++;
      return this.createResource();
    }
    
    // Wait for resource to become available
    return this.waitForResource();
  }
  
  release(resource: Resource): void {
    this.resources.push(resource);
  }
}
```

## Best Practices Summary

### Development
- Use performance monitoring from day one
- Profile regularly during development
- Test with realistic data sizes
- Implement gradual performance improvements

### Deployment
- Configure appropriate resource limits
- Set up comprehensive monitoring
- Use production-grade logging
- Implement automated health checks

### Maintenance
- Monitor trends, not just current values
- Set up alerting for performance degradation
- Regular performance reviews
- Proactive optimization based on usage patterns

### Scaling
- Plan for 3x current load
- Use horizontal scaling for high throughput
- Implement graceful degradation
- Monitor and optimize bottlenecks continuously

---

For more information:
- [Installation Guide](./installation.md) - Setup and configuration
- [Function Reference](./function-reference.md) - Complete API documentation
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
- [Architecture Documentation](./architecture/) - System design and scaling
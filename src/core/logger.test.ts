/**
 * Tests for the structured logging system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  createLogger, 
  createDebugger, 
  PerformanceMonitor,
  performanceMonitor
} from './logger.js';

describe('StructuredLogger', () => {
  let mockStderr: ReturnType<typeof vi.fn>;
  let originalStderr: typeof process.stderr.write;

  beforeEach(() => {
    // Mock stderr to capture log output
    originalStderr = process.stderr.write;
    mockStderr = vi.fn();
    process.stderr.write = mockStderr as any;
    
    // Reset environment variables
    delete process.env.FLUORITE_LOG_LEVEL;
    delete process.env.FLUORITE_LOG_FORMAT;
    delete process.env.FLUORITE_LOG_DISABLE;
    delete process.env.NODE_ENV;
    delete process.env.DEBUG;
  });

  afterEach(() => {
    // Restore stderr
    process.stderr.write = originalStderr;
  });

  describe('createLogger', () => {
    it('should create a logger with namespace', () => {
      const logger = createLogger('test-namespace', 'test-component');
      
      logger.info('Test message');
      
      expect(mockStderr).toHaveBeenCalled();
      const calls = mockStderr.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const logOutput = calls[calls.length - 1][0];
      expect(logOutput).toContain('test-namespace');
      expect(logOutput).toContain('Test message');
    });

    it('should respect log levels', () => {
      process.env.FLUORITE_LOG_LEVEL = 'warn';
      const logger = createLogger('test', 'component');
      
      // Should not log debug/info when level is warn
      logger.debug('Debug message');
      logger.info('Info message');
      
      expect(mockStderr).not.toHaveBeenCalled();
      
      // Should log warn and above
      logger.warn('Warning message');
      
      expect(mockStderr).toHaveBeenCalled();
      const calls = mockStderr.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const logOutput = calls[calls.length - 1][0];
      expect(logOutput).toContain('Warning message');
    });

    it('should output structured JSON when enabled', () => {
      process.env.FLUORITE_LOG_FORMAT = 'json';
      const logger = createLogger('test', 'component');
      
      logger.info('Test message', { operation: 'test' });
      
      const logOutput = mockStderr.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();
      
      const logEntry = JSON.parse(logOutput);
      expect(logEntry).toMatchObject({
        level: 'info',
        namespace: 'fluorite-mcp:test',
        message: 'Test message',
        component: 'component',
        operation: 'test'
      });
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should handle errors with categorization', () => {
      process.env.FLUORITE_LOG_FORMAT = 'json';
      const logger = createLogger('test');
      
      const testError = new Error('ENOENT: file not found');
      logger.error('Test error', testError);
      
      const logOutput = mockStderr.mock.calls[0][0];
      const logEntry = JSON.parse(logOutput);
      
      expect(logEntry).toMatchObject({
        level: 'error',
        message: 'Test error',
        error: {
          name: 'Error',
          message: 'ENOENT: file not found',
          category: 'FileNotFound'
        }
      });
    });

    it('should time function execution', async () => {
      process.env.FLUORITE_LOG_FORMAT = 'json';
      const logger = createLogger('test');
      
      const result = await logger.time('test-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'test-result';
      });
      
      expect(result).toBe('test-result');
      
      const logOutput = mockStderr.mock.calls[0][0];
      const logEntry = JSON.parse(logOutput);
      
      expect(logEntry).toMatchObject({
        level: 'info',
        message: 'Operation completed: test-operation',
        operation: 'test-operation'
      });
      expect(logEntry.duration).toBeGreaterThan(0);
    });

    it('should time synchronous function execution', () => {
      process.env.FLUORITE_LOG_FORMAT = 'json';
      const logger = createLogger('test');
      
      const result = logger.time('sync-operation', () => {
        return 'sync-result';
      });
      
      expect(result).toBe('sync-result');
      
      const logOutput = mockStderr.mock.calls[0][0];
      const logEntry = JSON.parse(logOutput);
      
      expect(logEntry).toMatchObject({
        level: 'info',
        message: 'Operation completed: sync-operation',
        operation: 'sync-operation'
      });
      expect(logEntry.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle timing errors correctly', async () => {
      process.env.FLUORITE_LOG_FORMAT = 'json';
      const logger = createLogger('test');
      
      await expect(
        logger.time('failing-operation', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
      
      const logOutput = mockStderr.mock.calls[0][0];
      const logEntry = JSON.parse(logOutput);
      
      expect(logEntry).toMatchObject({
        level: 'error',
        message: 'Operation failed: failing-operation',
        operation: 'failing-operation'
      });
      expect(logEntry.duration).toBeGreaterThanOrEqual(0);
    });

    it('should create child loggers', () => {
      process.env.FLUORITE_LOG_FORMAT = 'json';
      const parentLogger = createLogger('parent', 'parent-component');
      const childLogger = parentLogger.child('child', 'child-component');
      
      childLogger.info('Child message');
      
      const logOutput = mockStderr.mock.calls[0][0];
      const logEntry = JSON.parse(logOutput);
      
      expect(logEntry).toMatchObject({
        namespace: 'fluorite-mcp:parent:child',
        component: 'child-component',
        message: 'Child message'
      });
    });

    it('should provide observability metrics', () => {
      const logger = createLogger('metrics-test');
      
      logger.info('Test 1');
      logger.info('Test 2');
      logger.error('Error test', new Error('test'));
      
      const metrics = logger.getMetrics();
      
      expect(metrics).toMatchObject({
        operationCount: 3,
        errorCount: 1,
        errorRate: 1/3
      });
      expect(metrics.uptime).toBeGreaterThan(0);
      expect(metrics.memory).toBeDefined();
      expect(metrics.memory.heapUsed).toBeGreaterThan(0);
    });

    it('should not log when disabled', () => {
      process.env.FLUORITE_LOG_DISABLE = 'true';
      const logger = createLogger('disabled-test');
      
      logger.info('Should not appear');
      logger.error('Should not appear');
      
      expect(mockStderr).not.toHaveBeenCalled();
    });
  });

  describe('createDebugger', () => {
    it('should create debug function that only logs in debug mode', () => {
      process.env.NODE_ENV = 'development';
      process.env.FLUORITE_LOG_LEVEL = 'debug';  // Ensure debug level is enabled
      process.env.FLUORITE_LOG_FORMAT = 'json';  // Enable structured output for the test
      const debug = createDebugger('test-debug');
      
      debug('Debug message', { extra: 'data' });
      
      expect(mockStderr).toHaveBeenCalled();
      const calls = mockStderr.mock.calls;
      if (calls.length > 0) {
        const logOutput = calls[calls.length - 1][0];
        expect(logOutput).toContain('Debug message');
      }
    });

    it('should not log when not in debug mode', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DEBUG;
      delete process.env.FLUORITE_LOG_LEVEL;  // Use default level (info)
      const debug = createDebugger('test-debug');
      
      debug('Debug message');
      
      expect(mockStderr).not.toHaveBeenCalled();
    });
  });

  describe('error categorization', () => {
    it('should categorize different types of errors', () => {
      process.env.FLUORITE_LOG_FORMAT = 'json';
      const logger = createLogger('error-test');
      
      const testCases = [
        { error: new Error('ENOENT: file not found'), expectedCategory: 'FileNotFound' },
        { error: new Error('EACCES: permission denied'), expectedCategory: 'Permission' },
        { error: new Error('Request timeout'), expectedCategory: 'Timeout' },
        { error: new Error('Invalid input'), expectedCategory: 'Validation' },
        { error: new TypeError('Invalid type'), expectedCategory: 'Type' },
        { error: new Error('Unknown issue'), expectedCategory: 'Unknown' }
      ];
      
      testCases.forEach(({ error, expectedCategory }, index) => {
        // Clear mock before each call to isolate tests
        mockStderr.mockClear();
        logger.error(`Test error ${index}`, error);
        
        // Check that the logger was called
        expect(mockStderr).toHaveBeenCalled();
        const logOutput = mockStderr.mock.calls[0][0];
        const logEntry = JSON.parse(logOutput);
        
        expect(logEntry.error.category).toBe(expectedCategory);
      });
    });
  });
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  it('should record operation performance', () => {
    monitor.recordOperation('test-op', 100);
    monitor.recordOperation('test-op', 200);
    monitor.recordOperation('test-op', 50);
    
    const metrics = monitor.getMetrics();
    
    expect(metrics['test-op']).toEqual({
      avg: 116.67, // (100+200+50)/3 rounded
      max: 200,
      min: 50,
      count: 3
    });
  });

  it('should handle multiple operations', () => {
    monitor.recordOperation('op1', 100);
    monitor.recordOperation('op2', 50);
    monitor.recordOperation('op1', 150);
    
    const metrics = monitor.getMetrics();
    
    expect(metrics).toEqual({
      'op1': { avg: 125, max: 150, min: 100, count: 2 },
      'op2': { avg: 50, max: 50, min: 50, count: 1 }
    });
  });

  it('should reset metrics', () => {
    monitor.recordOperation('test', 100);
    monitor.reset();
    
    const metrics = monitor.getMetrics();
    expect(Object.keys(metrics)).toHaveLength(0);
  });

  it('should handle edge case with no operations', () => {
    const metrics = monitor.getMetrics();
    expect(metrics).toEqual({});
  });
});

describe('Global performanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.reset();
  });

  it('should be a singleton instance', () => {
    performanceMonitor.recordOperation('global-test', 123);
    
    const metrics = performanceMonitor.getMetrics();
    expect(metrics['global-test']).toEqual({
      avg: 123,
      max: 123,
      min: 123,
      count: 1
    });
  });
});

describe('Environment configuration', () => {
  let mockStderr: ReturnType<typeof vi.fn>;
  let originalStderr: typeof process.stderr.write;

  beforeEach(() => {
    // Mock stderr to capture log output
    originalStderr = process.stderr.write;
    mockStderr = vi.fn();
    process.stderr.write = mockStderr as any;
    
    // Clear all environment variables
    delete process.env.FLUORITE_LOG_LEVEL;
    delete process.env.FLUORITE_LOG_FORMAT;
    delete process.env.FLUORITE_LOG_DISABLE;
    delete process.env.NODE_ENV;
    delete process.env.DEBUG;
  });

  afterEach(() => {
    // Restore stderr
    process.stderr.write = originalStderr;
  });

  it('should use default configuration', () => {
    process.env.FLUORITE_LOG_FORMAT = 'json';
    const logger = createLogger('config-test');
    
    logger.info('Config test');
    
    expect(mockStderr).toHaveBeenCalled();
    const calls = mockStderr.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const logOutput = calls[0][0];
    const logEntry = JSON.parse(logOutput);
    
    expect(logEntry.level).toBe('info'); // Default level
    expect(logEntry.namespace).toBe('fluorite-mcp:config-test');
  });

  it('should respect FLUORITE_LOG_LEVEL', () => {
    process.env.FLUORITE_LOG_LEVEL = 'error';
    process.env.FLUORITE_LOG_FORMAT = 'json';
    const logger = createLogger('level-test');
    
    logger.info('Should not log');
    logger.error('Should log');
    
    expect(mockStderr).toHaveBeenCalled();
    const calls = mockStderr.mock.calls;
    expect(calls.length).toBe(1);
    const logOutput = calls[0][0];
    expect(logOutput).toContain('Should log');
  });
});
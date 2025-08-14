/**
 * Structured logging and observability system for fluorite-mcp
 * Provides JSON-structured logging, namespaced debugging, and performance metrics
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  namespace: string;
  message: string;
  component?: string;
  operation?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    category?: string;
  };
  [key: string]: any; // Allow any additional metadata fields
  requestId?: string;
  packageName?: string;
  performanceMetrics?: {
    memoryUsage?: NodeJS.MemoryUsage;
    responseTime?: number;
    operationCount?: number;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  namespace: string;
  enableStructured: boolean;
  enableConsole: boolean;
  enableDebug: boolean;
  requestIdHeader?: string;
  component?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5
};

class StructuredLogger {
  private config: LoggerConfig;
  private startTime = Date.now();
  private operationCount = 0;
  private errorCount = 0;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, metadata?: Partial<LogEntry>): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      namespace: this.config.namespace,
      message,
      component: this.config.component,
      ...metadata
    };

    // Increment operation count for all info, warn, error, fatal messages
    if (level === 'info' || level === 'warn' || level === 'error' || level === 'fatal') {
      this.operationCount++;
    }

    // Add performance metrics for important operations
    if (level === 'info' && metadata?.operation) {
      entry.performanceMetrics = {
        memoryUsage: process.memoryUsage(),
        operationCount: this.operationCount
      };
    }

    if (level === 'error' || level === 'fatal') {
      this.errorCount++;
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    if (this.config.enableStructured) {
      // JSON structured output to stderr for MCP protocol compatibility
      process.stderr.write(JSON.stringify(entry) + '\n');
    } else {
      // Human-readable output
      const timestamp = entry.timestamp.substring(11, 23); // HH:MM:SS.mmm
      const level = entry.level.toUpperCase().padEnd(5);
      const namespace = entry.namespace ? `[${entry.namespace}]` : '';
      const component = entry.component ? `{${entry.component}}` : '';
      const duration = entry.duration ? ` (${entry.duration}ms)` : '';
      
      const message = `${timestamp} ${level} ${namespace}${component} ${entry.message}${duration}`;
      
      // Always write to stderr for consistency and testability
      process.stderr.write(message + '\n');
      
      if (entry.error?.stack) {
        process.stderr.write(entry.error.stack + '\n');
      }
    }
  }

  trace(message: string, metadata?: Partial<LogEntry>): void {
    if (!this.shouldLog('trace')) return;
    this.output(this.formatMessage('trace', message, metadata));
  }

  debug(message: string, metadata?: Partial<LogEntry>): void {
    if (!this.shouldLog('debug')) return;
    this.output(this.formatMessage('debug', message, metadata));
  }

  info(message: string, metadata?: Partial<LogEntry>): void {
    if (!this.shouldLog('info')) return;
    this.output(this.formatMessage('info', message, metadata));
  }

  warn(message: string, metadata?: Partial<LogEntry>): void {
    if (!this.shouldLog('warn')) return;
    this.output(this.formatMessage('warn', message, metadata));
  }

  error(message: string, error?: Error, metadata?: Partial<LogEntry>): void {
    if (!this.shouldLog('error')) return;
    
    const errorInfo = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
      category: this.categorizeError(error)
    } : undefined;

    this.output(this.formatMessage('error', message, { 
      ...metadata, 
      error: errorInfo 
    }));
  }

  fatal(message: string, error?: Error, metadata?: Partial<LogEntry>): void {
    const errorInfo = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
      category: this.categorizeError(error)
    } : undefined;

    this.output(this.formatMessage('fatal', message, { 
      ...metadata, 
      error: errorInfo 
    }));
  }

  /**
   * Time a function execution and log the duration
   */
  time<T>(operation: string, fn: () => Promise<T>): Promise<T>;
  time<T>(operation: string, fn: () => T): T;
  time<T>(operation: string, fn: () => T | Promise<T>): T | Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            const duration = Date.now() - startTime;
            this.info(`Operation completed: ${operation}`, { 
              operation, 
              duration,
              performanceMetrics: { responseTime: duration }
            });
            return value;
          },
          (error) => {
            const duration = Date.now() - startTime;
            this.error(`Operation failed: ${operation}`, error, { 
              operation, 
              duration 
            });
            throw error;
          }
        );
      } else {
        const duration = Date.now() - startTime;
        this.info(`Operation completed: ${operation}`, { 
          operation, 
          duration,
          performanceMetrics: { responseTime: duration }
        });
        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`Operation failed: ${operation}`, error as Error, { 
        operation, 
        duration 
      });
      throw error;
    }
  }

  /**
   * Create a child logger with additional namespace
   */
  child(namespace: string, component?: string): StructuredLogger {
    return new StructuredLogger({
      ...this.config,
      namespace: `${this.config.namespace}:${namespace}`,
      component: component || this.config.component
    });
  }

  /**
   * Get observability metrics
   */
  getMetrics() {
    const uptime = Math.max(1, Date.now() - this.startTime);
    const memory = process.memoryUsage();
    
    return {
      uptime,
      operationCount: this.operationCount,
      errorCount: this.errorCount,
      errorRate: this.operationCount > 0 ? this.errorCount / this.operationCount : 0,
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memory.external / 1024 / 1024 * 100) / 100, // MB
        rss: Math.round(memory.rss / 1024 / 1024 * 100) / 100 // MB
      }
    };
  }

  private categorizeError(error: Error): string {
    // Categorize errors for better observability
    // Check error type first
    if (error.name === 'TypeError') return 'Type';
    if (error.name === 'RangeError') return 'Range';
    if (error.name === 'ValidationError') return 'Validation';
    if (error.name === 'FileSystemError') return 'FileSystem';
    
    // Then check message content
    const message = error.message.toLowerCase();
    if (message.includes('enoent')) return 'FileNotFound';
    if (message.includes('eacces')) return 'Permission';
    if (message.includes('emfile') || message.includes('enfile')) return 'FileSystem';
    if (message.includes('timeout')) return 'Timeout';
    if (message.includes('validation') || message.includes('invalid')) return 'Validation';
    if (message.includes('parse') || message.includes('syntax')) return 'Parse';
    
    return 'Unknown';
  }
}

// Get configuration from environment (re-evaluated each time)
const getDefaultConfig = (): LoggerConfig => ({
  level: (process.env.FLUORITE_LOG_LEVEL as LogLevel) || 'info',
  namespace: 'fluorite-mcp',
  enableStructured: process.env.FLUORITE_LOG_FORMAT === 'json',
  enableConsole: process.env.FLUORITE_LOG_DISABLE !== 'true',
  enableDebug: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'fluorite-mcp*',
  component: 'server'
});

// Create default logger
export const logger = new StructuredLogger(getDefaultConfig());

// Create namespace-specific loggers
export const createLogger = (namespace: string, component?: string): StructuredLogger => {
  // Create a new logger with current config for better testability
  const config = getDefaultConfig();
  return new StructuredLogger({
    ...config,
    namespace: `${config.namespace}:${namespace}`,
    component: component || config.component
  });
};

// Debug namespace function (similar to 'debug' package)
export const createDebugger = (namespace: string) => {
  const debugLogger = createLogger(`debug:${namespace}`);
  return (message: string, metadata?: any) => {
    const config = getDefaultConfig();
    // Check if debug level is enabled either through enableDebug flag or through log level
    if (config.enableDebug || LOG_LEVELS[config.level] <= LOG_LEVELS['debug']) {
      debugLogger.debug(message, { metadata });
    }
  };
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics = new Map<string, { count: number; totalTime: number; maxTime: number; minTime: number }>();

  recordOperation(name: string, duration: number): void {
    const existing = this.metrics.get(name) || { count: 0, totalTime: 0, maxTime: 0, minTime: Infinity };
    
    this.metrics.set(name, {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
      maxTime: Math.max(existing.maxTime, duration),
      minTime: Math.min(existing.minTime, duration)
    });
  }

  getMetrics(): Record<string, { avg: number; max: number; min: number; count: number }> {
    const result: Record<string, { avg: number; max: number; min: number; count: number }> = {};
    
    for (const [name, stats] of this.metrics) {
      result[name] = {
        avg: Math.round(stats.totalTime / stats.count * 100) / 100,
        max: stats.maxTime,
        min: stats.minTime === Infinity ? 0 : stats.minTime,
        count: stats.count
      };
    }
    
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
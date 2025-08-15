import { AnalysisContext, AnalysisResult } from './static-analyzer.js';
import { createLogger } from './logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const logger = createLogger('error-predictor', 'fluorite-mcp');

export interface PredictedError {
  type: string;
  probability: number; // 0-1
  message: string;
  location?: {
    file: string;
    line?: number;
    column?: number;
  };
  runtime: 'build' | 'runtime' | 'test';
  category: string;
  prevention: string;
  stackTrace?: string;
}

export interface ErrorPattern {
  id: string;
  name: string;
  pattern: RegExp | ((content: string) => boolean);
  predict: (match: any, context: AnalysisContext, file?: string) => PredictedError;
  frameworks?: string[];
}

export class ErrorPredictor {
  private patterns: ErrorPattern[] = [];
  private historicalErrors: Map<string, number> = new Map();

  constructor() {
    this.initializePatterns();
    this.initializeHistoricalData();
  }

  private initializePatterns(): void {
    // Next.js hydration errors
    this.patterns.push({
      id: 'nextjs-hydration',
      name: 'Next.js Hydration Mismatch',
      pattern: (content: string) => {
        // Detect patterns that commonly cause hydration errors
        const hasDateNow = content.includes('Date.now()') || content.includes('new Date()');
        const hasMathRandom = content.includes('Math.random()');
        const hasWindowCheck = content.includes('typeof window') && !content.includes('typeof window !== "undefined"');
        const hasLocalStorage = content.includes('localStorage') && !content.includes('typeof window');
        
        return hasDateNow || hasMathRandom || hasWindowCheck || hasLocalStorage;
      },
      predict: (match, context, file) => ({
        type: 'HydrationError',
        probability: 0.85,
        message: 'Potential hydration mismatch detected',
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'nextjs',
        prevention: 'Use useEffect for client-only code or ensure consistent server/client rendering',
        stackTrace: 'Error: Text content does not match server-rendered HTML'
      }),
      frameworks: ['nextjs']
    });

    // Undefined variable access
    this.patterns.push({
      id: 'undefined-access',
      name: 'Undefined Variable Access',
      pattern: /(\w+)\.(\w+)(?!\s*[?])/g,
      predict: (match, context, file) => {
        const [full, obj, prop] = match;
        return {
          type: 'TypeError',
          probability: 0.7,
          message: `Cannot read property '${prop}' of undefined`,
          location: { file: file || '' },
          runtime: 'runtime',
          category: 'type-error',
          prevention: `Use optional chaining: ${obj}?.${prop}`,
          stackTrace: `TypeError: Cannot read properties of undefined (reading '${prop}')`
        };
      }
    });

    // Async component errors
    this.patterns.push({
      id: 'async-component',
      name: 'Async Component Error',
      pattern: /async\s+function\s+\w+\s*\([^)]*\)\s*(?::\s*\w+\s*)?{[^}]*return\s*</, 
      predict: (match, context, file) => ({
        type: 'AsyncComponentError',
        probability: 0.9,
        message: 'Async components must be Server Components in Next.js',
        location: { file: file || '' },
        runtime: 'build',
        category: 'nextjs',
        prevention: 'Remove async or convert to Server Component',
        stackTrace: 'Error: Objects are not valid as a React child'
      }),
      frameworks: ['nextjs', 'react']
    });

    // Memory leak patterns
    this.patterns.push({
      id: 'memory-leak',
      name: 'Potential Memory Leak',
      pattern: (content: string) => {
        const hasIntervalWithoutClear = content.includes('setInterval') && !content.includes('clearInterval');
        const hasTimeoutWithoutClear = content.includes('setTimeout') && !content.includes('clearTimeout');
        const hasEventListenerWithoutRemove = content.includes('addEventListener') && !content.includes('removeEventListener');
        
        return hasIntervalWithoutClear || hasTimeoutWithoutClear || hasEventListenerWithoutRemove;
      },
      predict: (match, context, file) => ({
        type: 'MemoryLeak',
        probability: 0.75,
        message: 'Potential memory leak detected',
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'performance',
        prevention: 'Clean up timers and event listeners in cleanup functions',
        stackTrace: 'Warning: Memory usage continuously increasing'
      })
    });

    // Missing error boundaries
    this.patterns.push({
      id: 'missing-error-boundary',
      name: 'Missing Error Boundary',
      pattern: (content: string) => {
        const hasThrow = content.includes('throw ');
        const hasErrorBoundary = content.includes('componentDidCatch') || content.includes('ErrorBoundary');
        return hasThrow && !hasErrorBoundary;
      },
      predict: (match, context, file) => ({
        type: 'UnhandledError',
        probability: 0.6,
        message: 'Component may throw errors without error boundary',
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'error-handling',
        prevention: 'Wrap component with error boundary',
        stackTrace: 'Error: Uncaught error in component tree'
      }),
      frameworks: ['react', 'nextjs']
    });

    // Race conditions
    this.patterns.push({
      id: 'race-condition',
      name: 'Potential Race Condition',
      pattern: (content: string) => {
        const hasMultipleSetState = (content.match(/setState|setS[A-Z]\w*/g) || []).length > 2;
        const hasMultipleAsync = (content.match(/await/g) || []).length > 3;
        return hasMultipleSetState && hasMultipleAsync;
      },
      predict: (match, context, file) => ({
        type: 'RaceCondition',
        probability: 0.65,
        message: 'Potential race condition with multiple async operations',
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'concurrency',
        prevention: 'Use proper state management and async coordination',
        stackTrace: 'Warning: State update on unmounted component'
      })
    });

    // Infinite loops
    this.patterns.push({
      id: 'infinite-loop',
      name: 'Potential Infinite Loop',
      pattern: /useEffect\s*\(\s*\(\)\s*=>\s*{[^}]*set[A-Z]\w*[^}]*}\s*,\s*\[\s*\]\s*\)/,
      predict: (match, context, file) => ({
        type: 'InfiniteLoop',
        probability: 0.8,
        message: 'useEffect with setState and empty deps may cause infinite loop',
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'performance',
        prevention: 'Add proper dependencies or use useCallback',
        stackTrace: 'Maximum update depth exceeded'
      }),
      frameworks: ['react', 'nextjs']
    });

    // Build-time errors
    this.patterns.push({
      id: 'import-error',
      name: 'Import Resolution Error',
      pattern: /import\s+.*\s+from\s+['"](\.\.\/){4,}/,
      predict: (match, context, file) => ({
        type: 'ModuleNotFoundError',
        probability: 0.7,
        message: 'Deep relative imports may fail',
        location: { file: file || '' },
        runtime: 'build',
        category: 'module-resolution',
        prevention: 'Use absolute imports or path aliases',
        stackTrace: "Module not found: Can't resolve"
      })
    });

    // TypeScript errors
    this.patterns.push({
      id: 'type-assertion',
      name: 'Unsafe Type Assertion',
      pattern: /as\s+any|<any>/g,
      predict: (match, context, file) => ({
        type: 'TypeError',
        probability: 0.5,
        message: 'Unsafe type assertion may cause runtime errors',
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'type-safety',
        prevention: 'Use proper typing instead of any',
        stackTrace: 'TypeError: X is not a function'
      })
    });

    // API route errors
    this.patterns.push({
      id: 'api-cors',
      name: 'CORS Error',
      pattern: (content: string) => {
        const isApiRoute = content.includes('export async function GET') || 
                          content.includes('export async function POST');
        const hasCorsHeaders = content.includes('Access-Control-Allow-Origin');
        return isApiRoute && !hasCorsHeaders;
      },
      predict: (match, context, file) => ({
        type: 'CORSError',
        probability: 0.6,
        message: 'API route missing CORS headers',
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'api',
        prevention: 'Add CORS headers to API response',
        stackTrace: 'CORS policy: No Access-Control-Allow-Origin header'
      }),
      frameworks: ['nextjs']
    });

    // Environment variable errors
    this.patterns.push({
      id: 'env-var-error',
      name: 'Environment Variable Error',
      pattern: /process\.env\.(\w+)(?!\s*\|\||\s*\?\?)/g,
      predict: (match, context, file) => ({
        type: 'EnvironmentError',
        probability: 0.6,
        message: `Environment variable ${match[1]} may be undefined`,
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'configuration',
        prevention: `Provide fallback: process.env.${match[1]} || 'default'`,
        stackTrace: 'TypeError: Cannot read property of undefined'
      })
    });

    // Database connection errors
    this.patterns.push({
      id: 'db-connection',
      name: 'Database Connection Error',
      pattern: (content: string) => {
        const hasDbConnect = content.includes('connect(') || content.includes('createConnection');
        const hasErrorHandling = content.includes('.catch') || content.includes('try');
        return hasDbConnect && !hasErrorHandling;
      },
      predict: (match, context, file) => ({
        type: 'DatabaseError',
        probability: 0.75,
        message: 'Database connection without error handling',
        location: { file: file || '' },
        runtime: 'runtime',
        category: 'database',
        prevention: 'Add proper error handling for database connections',
        stackTrace: 'Error: Connection refused'
      })
    });
  }

  private initializeHistoricalData(): void {
    // Common error patterns from historical data
    this.historicalErrors.set('TypeError', 0.35);
    this.historicalErrors.set('ReferenceError', 0.25);
    this.historicalErrors.set('SyntaxError', 0.15);
    this.historicalErrors.set('RangeError', 0.05);
    this.historicalErrors.set('HydrationError', 0.1);
    this.historicalErrors.set('ModuleNotFoundError', 0.1);
  }

  public async predictErrors(context: AnalysisContext): Promise<PredictedError[]> {
    const predictions: PredictedError[] = [];
    const startTime = Date.now();

    try {
      if (!context.targetFiles) return predictions;

      for (const file of context.targetFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          for (const pattern of this.patterns) {
            // Check framework compatibility
            if (pattern.frameworks && context.framework) {
              if (!pattern.frameworks.includes(context.framework)) continue;
            }

            // Apply pattern
            if (typeof pattern.pattern === 'function') {
              if (pattern.pattern(content)) {
                const prediction = pattern.predict(null, context, file);
                predictions.push(prediction);
              }
            } else {
              let match;
              while ((match = pattern.pattern.exec(content)) !== null) {
                const prediction = pattern.predict(match, context, file);
                
                // Add line number if possible
                if (prediction.location) {
                  const lineNum = content.substring(0, match.index).split('\n').length;
                  prediction.location.line = lineNum;
                }
                
                predictions.push(prediction);
              }
            }
          }
        } catch (error) {
          logger.warn(`Could not analyze file ${file} for error prediction`, error as Error);
        }
      }

      // Adjust probabilities based on historical data
      for (const prediction of predictions) {
        const historicalRate = this.historicalErrors.get(prediction.type) || 0.5;
        prediction.probability = (prediction.probability + historicalRate) / 2;
      }

      // Sort by probability and severity
      predictions.sort((a, b) => {
        const severityOrder = { build: 0, test: 1, runtime: 2 };
        if (a.runtime !== b.runtime) {
          return severityOrder[a.runtime] - severityOrder[b.runtime];
        }
        return b.probability - a.probability;
      });

      const duration = Date.now() - startTime;
      logger.info('Error prediction completed', {
        duration,
        predictionsCount: predictions.length,
        highProbability: predictions.filter(p => p.probability > 0.7).length
      });

    } catch (error) {
      logger.error('Error prediction failed', error as Error);
    }

    return predictions;
  }

  public async generatePredictionReport(predictions: PredictedError[]): Promise<string> {
    const report = [
      '🔮 Error Prediction Report',
      '=' .repeat(50),
      '',
      `📊 Summary:`,
      `  • Total Predictions: ${predictions.length}`,
      `  • High Risk (>70%): ${predictions.filter(p => p.probability > 0.7).length}`,
      `  • Medium Risk (40-70%): ${predictions.filter(p => p.probability >= 0.4 && p.probability <= 0.7).length}`,
      `  • Low Risk (<40%): ${predictions.filter(p => p.probability < 0.4).length}`,
      '',
      '⚠️ Predicted Errors:',
      ''
    ];

    // Group by runtime phase
    const grouped = predictions.reduce((acc, pred) => {
      if (!acc[pred.runtime]) acc[pred.runtime] = [];
      acc[pred.runtime].push(pred);
      return acc;
    }, {} as Record<string, PredictedError[]>);

    for (const [phase, phasePredictions] of Object.entries(grouped)) {
      report.push(`\n🕐 ${phase.toUpperCase()} Phase:`);
      
      for (const pred of phasePredictions) {
        const riskIcon = pred.probability > 0.7 ? '🔴' :
                         pred.probability > 0.4 ? '🟡' : '🟢';
        
        report.push(`  ${riskIcon} ${pred.type} (${(pred.probability * 100).toFixed(0)}% probability)`);
        report.push(`     📝 ${pred.message}`);
        
        if (pred.location?.file) {
          report.push(`     📄 ${pred.location.file}${pred.location.line ? `:${pred.location.line}` : ''}`);
        }
        
        report.push(`     💡 Prevention: ${pred.prevention}`);
        
        if (pred.stackTrace) {
          report.push(`     🔍 Expected: ${pred.stackTrace}`);
        }
      }
    }

    if (predictions.length === 0) {
      report.push('✅ No significant error patterns detected!');
    }

    return report.join('\n');
  }

  public convertToAnalysisResults(predictions: PredictedError[]): AnalysisResult[] {
    return predictions.map(pred => ({
      severity: pred.probability > 0.7 ? 'error' : pred.probability > 0.4 ? 'warning' : 'info',
      category: pred.category,
      message: `${pred.type}: ${pred.message} (${(pred.probability * 100).toFixed(0)}% probability)`,
      file: pred.location?.file,
      line: pred.location?.line,
      suggestion: pred.prevention,
      confidence: pred.probability,
      rule: 'error-prediction'
    }));
  }
}

export default ErrorPredictor;
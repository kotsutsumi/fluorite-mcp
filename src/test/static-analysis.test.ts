import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StaticAnalyzer, StaticAnalyzerConfig, AnalysisContext } from '../core/static-analyzer.js';
import { NextJSAnalyzer } from '../core/nextjs-analyzer.js';
import { DependencyAnalyzer } from '../core/dependency-analyzer.js';
import { ErrorPredictor } from '../core/error-predictor.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Static Analysis System', () => {
  let tempDir: string;
  let analyzer: StaticAnalyzer;

  beforeEach(async () => {
    // Create temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fluorite-test-'));
    analyzer = new StaticAnalyzer();
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('Core Static Analyzer', () => {
    it('should detect unused imports', async () => {
      const testFile = path.join(tempDir, 'test.ts');
      await fs.writeFile(testFile, `
        import { useState } from 'react';
        import { useEffect } from 'react';
        
        export function Component() {
          const [state] = useState(0);
          return state;
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile]
      };

      const results = await analyzer.analyze(context);
      const unusedImport = results.find(r => r.rule === 'unused-imports');
      
      expect(unusedImport).toBeDefined();
      expect(unusedImport?.message).toContain('useEffect');
    });

    it('should detect missing error handling in async functions', async () => {
      const testFile = path.join(tempDir, 'async.ts');
      await fs.writeFile(testFile, `
        async function fetchData() {
          const response = await fetch('/api/data');
          return response.json();
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile]
      };

      const results = await analyzer.analyze(context);
      const errorHandling = results.find(r => r.rule === 'async-await-error-handling');
      
      expect(errorHandling).toBeDefined();
      expect(errorHandling?.severity).toBe('error');
    });

    it('should detect console.log statements', async () => {
      const testFile = path.join(tempDir, 'debug.ts');
      await fs.writeFile(testFile, `
        function debug() {
          console.log('Debug message');
          console.error('Error message');
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile]
      };

      const results = await analyzer.analyze(context);
      const consoleLogs = results.filter(r => r.rule === 'console-log-detection');
      
      expect(consoleLogs).toHaveLength(2);
    });

    it('should check TypeScript strict settings', async () => {
      const tsConfig = {
        compilerOptions: {
          strictNullChecks: false
        }
      };

      const context: AnalysisContext = {
        projectPath: tempDir,
        tsConfig
      };

      const results = await analyzer.analyze(context);
      const strictCheck = results.find(r => r.rule === 'ts-strict-null-checks');
      
      expect(strictCheck).toBeDefined();
      expect(strictCheck?.severity).toBe('error');
    });
  });

  describe('Next.js Analyzer', () => {
    let nextAnalyzer: NextJSAnalyzer;

    beforeEach(() => {
      nextAnalyzer = new NextJSAnalyzer();
      nextAnalyzer.getRules().forEach(rule => analyzer.addRule(rule));
    });

    it('should detect client hooks in server components', async () => {
      const testFile = path.join(tempDir, 'app', 'page.tsx');
      await fs.mkdir(path.join(tempDir, 'app'), { recursive: true });
      await fs.writeFile(testFile, `
        import { useState } from 'react';
        
        export default function Page() {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile],
        framework: 'nextjs'
      };

      const results = await analyzer.analyze(context);
      const serverComponent = results.find(r => r.rule === 'nextjs-server-components');
      
      expect(serverComponent).toBeDefined();
      expect(serverComponent?.message).toContain('useState');
      expect(serverComponent?.suggestion).toContain('use client');
    });

    it('should detect missing metadata in pages', async () => {
      const testFile = path.join(tempDir, 'app', 'page.tsx');
      await fs.mkdir(path.join(tempDir, 'app'), { recursive: true });
      await fs.writeFile(testFile, `
        export default function Page() {
          return <h1>Hello World</h1>;
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile],
        framework: 'nextjs'
      };

      const results = await analyzer.analyze(context);
      const metadata = results.find(r => r.message.includes('metadata'));
      
      expect(metadata).toBeDefined();
      expect(metadata?.severity).toBe('warning');
    });

    it('should detect native img tags instead of Next.js Image', async () => {
      const testFile = path.join(tempDir, 'component.tsx');
      await fs.writeFile(testFile, `
        export function Gallery() {
          return <img src="/photo.jpg" alt="Photo" />;
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile],
        framework: 'nextjs'
      };

      const results = await analyzer.analyze(context);
      const imageOptimization = results.find(r => r.rule === 'nextjs-image-optimization');
      
      expect(imageOptimization).toBeDefined();
      expect(imageOptimization?.suggestion).toContain('next/image');
    });

    it('should validate API route handlers', async () => {
      const testFile = path.join(tempDir, 'app', 'api', 'test', 'route.ts');
      await fs.mkdir(path.join(tempDir, 'app', 'api', 'test'), { recursive: true });
      await fs.writeFile(testFile, `
        export function handler(req, res) {
          res.json({ message: 'Hello' });
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile],
        framework: 'nextjs'
      };

      const results = await analyzer.analyze(context);
      const apiRoute = results.find(r => r.rule === 'nextjs-api-routes');
      
      expect(apiRoute).toBeDefined();
      expect(apiRoute?.message).toContain('HTTP method');
    });

    it('should detect non-public env vars in client components', async () => {
      const testFile = path.join(tempDir, 'component.tsx');
      await fs.writeFile(testFile, `
        'use client';
        
        export function Config() {
          const apiKey = process.env.API_KEY;
          const publicKey = process.env.NEXT_PUBLIC_KEY;
          return <div>{publicKey}</div>;
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile],
        framework: 'nextjs'
      };

      const results = await analyzer.analyze(context);
      const envVar = results.find(r => r.rule === 'nextjs-env-vars');
      
      expect(envVar).toBeDefined();
      expect(envVar?.message).toContain('API_KEY');
      expect(envVar?.severity).toBe('error');
    });
  });

  describe('Dependency Analyzer', () => {
    let depAnalyzer: DependencyAnalyzer;

    beforeEach(() => {
      depAnalyzer = new DependencyAnalyzer();
      depAnalyzer.getRules().forEach(rule => analyzer.addRule(rule));
    });

    it('should detect missing dependencies', async () => {
      const testFile = path.join(tempDir, 'index.ts');
      await fs.writeFile(testFile, `
        import lodash from 'lodash';
        import axios from 'axios';
        
        console.log(lodash.VERSION);
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile],
        dependencies: {
          'lodash': '^4.17.21'
        },
        devDependencies: {}
      };

      const results = await analyzer.analyze(context);
      const missingDep = results.find(r => r.message.includes('axios'));
      
      expect(missingDep).toBeDefined();
      expect(missingDep?.severity).toBe('error');
    });

    it('should detect version conflicts', async () => {
      const context: AnalysisContext = {
        projectPath: tempDir,
        dependencies: {
          'next': '14.0.0',
          'react': '17.0.0' // Incompatible with Next.js 14
        }
      };

      const results = await analyzer.analyze(context);
      const versionConflict = results.find(r => r.rule === 'version-conflict');
      
      expect(versionConflict).toBeDefined();
      expect(versionConflict?.message).toContain('incompatible');
    });

    it('should detect duplicate packages', async () => {
      const context: AnalysisContext = {
        projectPath: tempDir,
        dependencies: {
          'lodash': '^4.17.21'
        },
        devDependencies: {
          'lodash': '^4.17.21'
        }
      };

      const results = await analyzer.analyze(context);
      const duplicate = results.find(r => r.rule === 'duplicate-package');
      
      expect(duplicate).toBeDefined();
      expect(duplicate?.message).toContain('both dependencies and devDependencies');
    });
  });

  describe('Error Predictor', () => {
    let errorPredictor: ErrorPredictor;

    beforeEach(() => {
      errorPredictor = new ErrorPredictor();
    });

    it('should predict hydration errors', async () => {
      const testFile = path.join(tempDir, 'component.tsx');
      await fs.writeFile(testFile, `
        export function TimeDisplay() {
          const time = Date.now();
          return <div>Current time: {time}</div>;
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile],
        framework: 'nextjs'
      };

      const predictions = await errorPredictor.predictErrors(context);
      const hydrationError = predictions.find(p => p.type === 'HydrationError');
      
      expect(hydrationError).toBeDefined();
      expect(hydrationError?.probability).toBeGreaterThan(0.7);
    });

    it('should predict memory leaks', async () => {
      const testFile = path.join(tempDir, 'component.tsx');
      await fs.writeFile(testFile, `
        export function Timer() {
          setInterval(() => {
            console.log('tick');
          }, 1000);
          
          return <div>Timer</div>;
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile]
      };

      const predictions = await errorPredictor.predictErrors(context);
      const memoryLeak = predictions.find(p => p.type === 'MemoryLeak');
      
      expect(memoryLeak).toBeDefined();
      expect(memoryLeak?.prevention).toContain('cleanup');
    });

    it('should predict undefined access errors', async () => {
      const testFile = path.join(tempDir, 'utils.ts');
      await fs.writeFile(testFile, `
        function processUser(user) {
          return user.profile.name.toUpperCase();
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile]
      };

      const predictions = await errorPredictor.predictErrors(context);
      const undefinedError = predictions.find(p => p.type === 'TypeError');
      
      expect(undefinedError).toBeDefined();
      expect(undefinedError?.prevention).toContain('optional chaining');
    });

    it('should predict async component errors', async () => {
      const testFile = path.join(tempDir, 'component.tsx');
      await fs.writeFile(testFile, `
        async function DataComponent() {
          const data = await fetch('/api/data');
          return <div>{data}</div>;
        }
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile],
        framework: 'nextjs'
      };

      const predictions = await errorPredictor.predictErrors(context);
      const asyncError = predictions.find(p => p.type === 'AsyncComponentError');
      
      expect(asyncError).toBeDefined();
      expect(asyncError?.probability).toBeGreaterThan(0.8);
    });

    it('should predict environment variable errors', async () => {
      const testFile = path.join(tempDir, 'config.ts');
      await fs.writeFile(testFile, `
        export const config = {
          apiUrl: process.env.API_URL,
          apiKey: process.env.API_KEY
        };
      `);

      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [testFile]
      };

      const predictions = await errorPredictor.predictErrors(context);
      const envErrors = predictions.filter(p => p.type === 'EnvironmentError');
      
      expect(envErrors.length).toBeGreaterThan(0);
      expect(envErrors[0]?.prevention).toContain('fallback');
    });
  });

  describe('Integration Tests', () => {
    it('should perform comprehensive analysis with all analyzers', async () => {
      // Setup test project structure
      const appDir = path.join(tempDir, 'app');
      await fs.mkdir(appDir, { recursive: true });
      
      // Create package.json
      await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify({
        name: 'test-project',
        dependencies: {
          'next': '14.0.0',
          'react': '18.2.0',
          'react-dom': '18.2.0'
        },
        devDependencies: {
          'typescript': '5.0.0'
        }
      }));

      // Create a problematic component
      await fs.writeFile(path.join(appDir, 'page.tsx'), `
        import { useState, useEffect } from 'react';
        import lodash from 'lodash';
        
        export default function Page() {
          const [data, setData] = useState(null);
          const time = Date.now();
          
          useEffect(() => {
            fetch('/api/data')
              .then(res => res.json())
              .then(setData);
          }, []);
          
          console.log('Rendering page');
          
          return (
            <div>
              <img src="/logo.png" alt="Logo" />
              <p>Time: {time}</p>
              <p>Data: {data.value}</p>
            </div>
          );
        }
      `);

      // Configure analyzer with all modules
      const config: StaticAnalyzerConfig = {
        strictMode: true
      };

      const fullAnalyzer = new StaticAnalyzer(config);
      
      // Add all analyzer rules
      const nextjsAnalyzer = new NextJSAnalyzer();
      nextjsAnalyzer.getRules().forEach(rule => fullAnalyzer.addRule(rule));
      
      const depAnalyzer = new DependencyAnalyzer();
      depAnalyzer.getRules().forEach(rule => fullAnalyzer.addRule(rule));

      // Create context
      const context: AnalysisContext = {
        projectPath: tempDir,
        targetFiles: [path.join(appDir, 'page.tsx')],
        framework: 'nextjs',
        packageJson: JSON.parse(await fs.readFile(path.join(tempDir, 'package.json'), 'utf-8'))
      };

      // Run analysis
      const results = await fullAnalyzer.analyze(context);
      
      // Run error prediction
      const errorPredictor = new ErrorPredictor();
      const predictions = await errorPredictor.predictErrors(context);

      // Verify comprehensive detection
      expect(results.length).toBeGreaterThan(0);
      expect(predictions.length).toBeGreaterThan(0);
      
      // Check for specific issues
      const hasClientHook = results.some(r => r.message.includes('useState'));
      const hasConsoleLog = results.some(r => r.message.includes('console'));
      const hasMissingDep = results.some(r => r.message.includes('lodash'));
      const hasImageIssue = results.some(r => r.message.includes('img'));
      
      expect(hasClientHook).toBe(true);
      expect(hasConsoleLog).toBe(true);
      expect(hasMissingDep).toBe(true);
      expect(hasImageIssue).toBe(true);
      
      // Check predictions
      const hasHydrationPrediction = predictions.some(p => p.type === 'HydrationError');
      const hasTypeErrorPrediction = predictions.some(p => p.type === 'TypeError');
      
      expect(hasHydrationPrediction).toBe(true);
      expect(hasTypeErrorPrediction).toBe(true);
    });

    it('should generate comprehensive report', async () => {
      const analyzer = new StaticAnalyzer();
      
      const mockResults = [
        {
          severity: 'error' as const,
          category: 'type-safety',
          message: 'Type error detected',
          file: 'test.ts',
          line: 10,
          suggestion: 'Fix type error',
          confidence: 0.9,
          rule: 'type-check'
        },
        {
          severity: 'warning' as const,
          category: 'performance',
          message: 'Performance issue',
          file: 'component.tsx',
          line: 25,
          suggestion: 'Optimize component',
          confidence: 0.7,
          rule: 'perf-check'
        }
      ];

      const report = await analyzer.generateReport(mockResults);
      
      expect(report).toContain('Static Analysis Report');
      expect(report).toContain('Errors: 1');
      expect(report).toContain('Warnings: 1');
      expect(report).toContain('Type error detected');
      expect(report).toContain('Performance issue');
    });
  });
});
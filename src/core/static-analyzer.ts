import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('static-analyzer', 'fluorite-mcp');

export interface AnalysisResult {
  severity: 'error' | 'warning' | 'info' | 'success';
  category: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  suggestion?: string;
  autoFix?: string;
  confidence: number; // 0-1 confidence score
  framework?: string;
  rule?: string;
}

export interface AnalysisContext {
  projectPath: string;
  framework?: string;
  targetFiles?: string[];
  configFiles?: Record<string, any>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  tsConfig?: any;
  packageJson?: any;
  customRules?: ValidationRule[];
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  frameworks?: string[];
  filePatterns?: RegExp[];
  validate: (context: AnalysisContext, content: string, filePath: string) => Promise<AnalysisResult[]>;
}

export interface StaticAnalyzerConfig {
  enabledRules?: string[];
  disabledRules?: string[];
  customRules?: ValidationRule[];
  strictMode?: boolean;
  autoFix?: boolean;
  maxIssues?: number;
  frameworks?: string[];
  performanceThresholds?: {
    bundleSize?: number;
    loadTime?: number;
    renderTime?: number;
  };
}

export class StaticAnalyzer {
  private rules: Map<string, ValidationRule> = new Map();
  private config: StaticAnalyzerConfig;
  private frameworkDetectors: Map<string, (context: AnalysisContext) => Promise<boolean>> = new Map();

  constructor(config: StaticAnalyzerConfig = {}) {
    this.config = {
      strictMode: true,
      autoFix: false,
      maxIssues: 1000,
      ...config
    };
    this.initializeBuiltInRules();
    this.initializeFrameworkDetectors();
  }

  private initializeBuiltInRules(): void {
    // TypeScript/JavaScript validation rules
    this.addRule({
      id: 'ts-strict-null-checks',
      name: 'TypeScript Strict Null Checks',
      description: 'Ensures strict null checking is enabled',
      severity: 'error',
      category: 'type-safety',
      validate: async (context) => {
        const results: AnalysisResult[] = [];
        if (context.tsConfig?.compilerOptions?.strictNullChecks === false) {
          results.push({
            severity: 'error',
            category: 'type-safety',
            message: 'TypeScript strict null checks are disabled',
            file: 'tsconfig.json',
            suggestion: 'Enable strictNullChecks in tsconfig.json for better type safety',
            autoFix: JSON.stringify({ ...context.tsConfig, compilerOptions: { ...context.tsConfig.compilerOptions, strictNullChecks: true } }, null, 2),
            confidence: 1.0,
            rule: 'ts-strict-null-checks'
          });
        }
        return results;
      }
    });

    this.addRule({
      id: 'unused-imports',
      name: 'Unused Imports Detection',
      description: 'Detects unused import statements',
      severity: 'warning',
      category: 'code-quality',
      filePatterns: [/\.(ts|tsx|js|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        const importRegex = /import\s+(?:{([^}]+)}|(\w+)|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/g;
        const imports: Map<string, { line: number; source: string }> = new Map();
        
        let match;
        let lineNum = 1;
        const lines = content.split('\n');
        
        for (const line of lines) {
          const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+)|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/);
          if (importMatch) {
            const imported = importMatch[1] || importMatch[2] || importMatch[3];
            if (imported) {
              const names = imported.includes(',') ? imported.split(',').map(n => n.trim()) : [imported.trim()];
              names.forEach(name => {
                imports.set(name.split(' as ')[0].trim(), { line: lineNum, source: importMatch[4] });
              });
            }
          }
          lineNum++;
        }

        // Check if imports are used
        imports.forEach((importInfo, importName) => {
          const usageRegex = new RegExp(`\\b${importName}\\b`, 'g');
          const contentWithoutImports = content.split('\n').filter((_, i) => !lines[i].includes('import')).join('\n');
          
          if (!contentWithoutImports.match(usageRegex)) {
            results.push({
              severity: 'warning',
              category: 'code-quality',
              message: `Import '${importName}' from '${importInfo.source}' is never used`,
              file: filePath,
              line: importInfo.line,
              suggestion: `Remove unused import '${importName}'`,
              confidence: 0.9,
              rule: 'unused-imports'
            });
          }
        });

        return results;
      }
    });

    this.addRule({
      id: 'async-await-error-handling',
      name: 'Async/Await Error Handling',
      description: 'Ensures proper error handling for async functions',
      severity: 'error',
      category: 'error-handling',
      filePatterns: [/\.(ts|tsx|js|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        const asyncFuncRegex = /async\s+(?:function\s+)?(\w+)?[^{]*{([^}]*)}/g;
        
        let match;
        while ((match = asyncFuncRegex.exec(content)) !== null) {
          const funcBody = match[2];
          const funcName = match[1] || 'anonymous';
          
          if (funcBody.includes('await') && !funcBody.includes('try') && !funcBody.includes('catch')) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            results.push({
              severity: 'error',
              category: 'error-handling',
              message: `Async function '${funcName}' lacks error handling`,
              file: filePath,
              line: lineNum,
              suggestion: 'Wrap await calls in try-catch blocks or use .catch() for proper error handling',
              confidence: 0.85,
              rule: 'async-await-error-handling'
            });
          }
        }

        return results;
      }
    });

    this.addRule({
      id: 'dependency-version-check',
      name: 'Dependency Version Validation',
      description: 'Checks for outdated or vulnerable dependencies',
      severity: 'warning',
      category: 'dependencies',
      validate: async (context) => {
        const results: AnalysisResult[] = [];
        
        // Check for exact version pinning
        Object.entries(context.dependencies || {}).forEach(([pkg, version]) => {
          if (version.startsWith('^') || version.startsWith('~')) {
            results.push({
              severity: 'info',
              category: 'dependencies',
              message: `Dependency '${pkg}' uses range version '${version}'`,
              file: 'package.json',
              suggestion: 'Consider using exact versions for production dependencies to ensure consistency',
              confidence: 0.7,
              rule: 'dependency-version-check'
            });
          }
        });

        return results;
      }
    });

    this.addRule({
      id: 'console-log-detection',
      name: 'Console Log Detection',
      description: 'Detects console.log statements in production code',
      severity: 'warning',
      category: 'code-quality',
      filePatterns: [/\.(ts|tsx|js|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        const consoleRegex = /console\.(log|error|warn|info|debug|trace)\(/g;
        
        let match;
        while ((match = consoleRegex.exec(content)) !== null) {
          const lineNum = content.substring(0, match.index).split('\n').length;
          results.push({
            severity: 'warning',
            category: 'code-quality',
            message: `Console statement found: ${match[0]}`,
            file: filePath,
            line: lineNum,
            suggestion: 'Remove console statements or use a proper logging library',
            confidence: 1.0,
            rule: 'console-log-detection'
          });
        }

        return results;
      }
    });
  }

  private initializeFrameworkDetectors(): void {
    // Next.js detector
    this.frameworkDetectors.set('nextjs', async (context) => {
      if (context.packageJson?.dependencies?.next || context.packageJson?.devDependencies?.next) {
        return true;
      }
      try {
        await fs.access(path.join(context.projectPath, 'next.config.js'));
        return true;
      } catch {
        try {
          await fs.access(path.join(context.projectPath, 'next.config.mjs'));
          return true;
        } catch {
          return false;
        }
      }
    });

    // React detector
    this.frameworkDetectors.set('react', async (context) => {
      return !!(context.packageJson?.dependencies?.react || context.packageJson?.devDependencies?.react);
    });

    // Vue detector
    this.frameworkDetectors.set('vue', async (context) => {
      return !!(context.packageJson?.dependencies?.vue || context.packageJson?.devDependencies?.vue);
    });

    // Angular detector
    this.frameworkDetectors.set('angular', async (context) => {
      return !!(context.packageJson?.dependencies?.['@angular/core'] || context.packageJson?.devDependencies?.['@angular/core']);
    });
  }

  public addRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
    logger.debug(`Added validation rule: ${rule.id}`, { rule: rule.name });
  }

  public async detectFrameworks(context: AnalysisContext): Promise<string[]> {
    const detectedFrameworks: string[] = [];
    
    for (const [framework, detector] of this.frameworkDetectors) {
      if (await detector(context)) {
        detectedFrameworks.push(framework);
        logger.info(`Detected framework: ${framework}`, { projectPath: context.projectPath });
      }
    }

    return detectedFrameworks;
  }

  public async analyze(context: AnalysisContext): Promise<AnalysisResult[]> {
    const startTime = Date.now();
    const results: AnalysisResult[] = [];

    try {
      // Load project configuration if not provided
      if (!context.packageJson && context.projectPath) {
        try {
          const packageJsonPath = path.join(context.projectPath, 'package.json');
          const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
          context.packageJson = JSON.parse(packageJsonContent);
          context.dependencies = context.packageJson.dependencies || {};
          context.devDependencies = context.packageJson.devDependencies || {};
        } catch (error) {
          logger.warn('Could not load package.json', error as Error);
        }
      }

      if (!context.tsConfig && context.projectPath) {
        try {
          const tsConfigPath = path.join(context.projectPath, 'tsconfig.json');
          const tsConfigContent = await fs.readFile(tsConfigPath, 'utf-8');
          context.tsConfig = JSON.parse(tsConfigContent);
        } catch (error) {
          logger.debug('No tsconfig.json found', error as Error);
        }
      }

      // Detect frameworks
      const detectedFrameworks = await this.detectFrameworks(context);
      context.framework = context.framework || detectedFrameworks[0];

      // Run validation rules
      for (const [ruleId, rule] of this.rules) {
        // Skip disabled rules
        if (this.config.disabledRules?.includes(ruleId)) continue;
        
        // Skip rules not in enabled list if specified
        if (this.config.enabledRules && !this.config.enabledRules.includes(ruleId)) continue;

        // Check framework compatibility
        if (rule.frameworks && context.framework && !rule.frameworks.includes(context.framework)) continue;

        try {
          // For file-specific rules, analyze target files
          if (rule.filePatterns && context.targetFiles) {
            for (const file of context.targetFiles) {
              const shouldAnalyze = rule.filePatterns.some(pattern => pattern.test(file));
              if (shouldAnalyze) {
                const content = await fs.readFile(file, 'utf-8');
                const ruleResults = await rule.validate(context, content, file);
                results.push(...ruleResults);
              }
            }
          } else {
            // Context-wide rules
            const ruleResults = await rule.validate(context, '', '');
            results.push(...ruleResults);
          }
        } catch (error) {
          logger.error(`Error running rule ${ruleId}`, error as Error);
        }

        // Stop if we've reached max issues
        if (results.length >= (this.config.maxIssues || 1000)) {
          logger.warn('Maximum issues reached, stopping analysis');
          break;
        }
      }

      // Sort results by severity
      results.sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, info: 2, success: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      const duration = Date.now() - startTime;
      logger.info('Static analysis completed', {
        duration,
        issuesFound: results.length,
        errors: results.filter(r => r.severity === 'error').length,
        warnings: results.filter(r => r.severity === 'warning').length,
        framework: context.framework
      });

    } catch (error) {
      logger.error('Static analysis failed', error as Error);
      throw error;
    }

    return results;
  }

  public async generateReport(results: AnalysisResult[]): Promise<string> {
    const errorCount = results.filter(r => r.severity === 'error').length;
    const warningCount = results.filter(r => r.severity === 'warning').length;
    const infoCount = results.filter(r => r.severity === 'info').length;

    const report = [
      '📊 Static Analysis Report',
      '=' .repeat(50),
      '',
      `🔍 Summary:`,
      `  • Errors: ${errorCount}`,
      `  • Warnings: ${warningCount}`,
      `  • Info: ${infoCount}`,
      '',
      '📋 Issues:',
      ''
    ];

    const groupedResults = results.reduce((acc, result) => {
      const key = result.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    }, {} as Record<string, AnalysisResult[]>);

    for (const [category, categoryResults] of Object.entries(groupedResults)) {
      report.push(`\n📁 ${category}:`);
      for (const result of categoryResults) {
        const icon = result.severity === 'error' ? '❌' :
                     result.severity === 'warning' ? '⚠️' :
                     result.severity === 'info' ? 'ℹ️' : '✅';
        
        report.push(`  ${icon} ${result.message}`);
        if (result.file) {
          report.push(`     📄 ${result.file}${result.line ? `:${result.line}` : ''}`);
        }
        if (result.suggestion) {
          report.push(`     💡 ${result.suggestion}`);
        }
        if (result.confidence < 1.0) {
          report.push(`     🎯 Confidence: ${(result.confidence * 100).toFixed(0)}%`);
        }
      }
    }

    if (results.length === 0) {
      report.push('✅ No issues found! Your code is ready for execution.');
    }

    return report.join('\n');
  }

  public async autoFix(results: AnalysisResult[]): Promise<Map<string, string>> {
    const fixes = new Map<string, string>();
    
    if (!this.config.autoFix) {
      logger.info('Auto-fix is disabled');
      return fixes;
    }

    for (const result of results) {
      if (result.autoFix && result.file) {
        fixes.set(result.file, result.autoFix);
        logger.info(`Generated auto-fix for ${result.file}`, { rule: result.rule });
      }
    }

    return fixes;
  }
}

export default StaticAnalyzer;
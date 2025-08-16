// Define the ToolCallResult type to match the MCP handler pattern
interface ToolCallResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  metadata?: any;
  [key: string]: any; // Index signature for additional properties
}
import { StaticAnalyzer, StaticAnalyzerConfig, AnalysisContext } from './static-analyzer.js';
import { NextJSAnalyzer } from './nextjs-analyzer.js';
import { VueAnalyzer } from './vue-analyzer.js';
import { ReactAnalyzer } from './react-analyzer.js';
import { DependencyAnalyzer } from './dependency-analyzer.js';
import { ErrorPredictor } from './error-predictor.js';
import { createLogger } from './logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const logger = createLogger('static-analysis-handlers', 'fluorite-mcp');

/**
 * Recursively discovers project files for static analysis, excluding common
 * build directories and including only relevant source file extensions.
 * 
 * @param dirPath - Root directory path to search from
 * @param files - Accumulator array for discovered files (used internally for recursion)
 * @returns Promise resolving to array of file paths suitable for analysis
 * 
 * @example
 * ```typescript
 * const files = await findProjectFiles('./src');
 * console.log(files); // ['./src/index.ts', './src/components/Button.tsx']
 * ```
 */
async function findProjectFiles(dirPath: string, files: string[] = []): Promise<string[]> {
  const excludeDirs = new Set(['node_modules', 'dist', 'build', '.next', '.git', 'coverage']);
  const includeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (!excludeDirs.has(entry.name) && !entry.name.startsWith('.')) {
          await findProjectFiles(fullPath, files);
        }
      } else if (entry.isFile()) {
        // Include files with relevant extensions
        const ext = path.extname(entry.name);
        if (includeExtensions.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    logger.warn(`Could not read directory ${dirPath}`, error as Error);
  }
  
  return files;
}

export interface StaticAnalysisInput {
  projectPath: string;
  targetFiles?: string[];
  framework?: string;
  enabledRules?: string[];
  disabledRules?: string[];
  strictMode?: boolean;
  autoFix?: boolean;
  predictErrors?: boolean;
  analyzeDependencies?: boolean;
  maxIssues?: number;
}

export interface QuickValidateInput {
  code: string;
  language?: 'typescript' | 'javascript' | 'jsx' | 'tsx';
  framework?: string;
  fileName?: string;
}

export interface RealTimeValidationInput {
  file: string;
  content?: string;
  framework?: string;
  watchMode?: boolean;
}

/**
 * Handles comprehensive static analysis tool requests with framework-specific rules,
 * error prediction, and dependency analysis. Provides detailed reports with
 * auto-fix suggestions and performance metrics.
 * 
 * @param input - Configuration object for static analysis
 * @param input.projectPath - Root directory of the project to analyze
 * @param input.targetFiles - Optional array of specific files to analyze
 * @param input.framework - Target framework (nextjs, react, vue) for specialized rules
 * @param input.enabledRules - Array of specific rule IDs to enable
 * @param input.disabledRules - Array of specific rule IDs to disable
 * @param input.strictMode - Enable strict validation mode (default: true)
 * @param input.autoFix - Generate auto-fix suggestions (default: false)
 * @param input.predictErrors - Enable error prediction analysis (default: true)
 * @param input.analyzeDependencies - Include dependency analysis (default: true)
 * @param input.maxIssues - Maximum number of issues to report (default: 1000)
 * @returns Promise resolving to tool call result with analysis report and metadata
 * 
 * @example
 * ```typescript
 * const result = await handleStaticAnalysisTool({
 *   projectPath: './my-project',
 *   framework: 'nextjs',
 *   strictMode: true,
 *   predictErrors: true
 * });
 * console.log(result.metadata.issuesFound); // Number of issues detected
 * ```
 */
export async function handleStaticAnalysisTool(input: StaticAnalysisInput): Promise<ToolCallResult> {
  const startTime = Date.now();
  
  try {
    logger.info('Starting comprehensive static analysis', {
      projectPath: input.projectPath,
      targetFiles: input.targetFiles?.length,
      framework: input.framework
    });

    // Create analysis context
    const context: AnalysisContext = {
      projectPath: input.projectPath,
      framework: input.framework,
      targetFiles: input.targetFiles
    };

    // If no target files specified, analyze all relevant files
    if (!context.targetFiles) {
      const files = await findProjectFiles(input.projectPath);
      context.targetFiles = files;
    }

    // Initialize analyzers
    const config: StaticAnalyzerConfig = {
      enabledRules: input.enabledRules,
      disabledRules: input.disabledRules,
      strictMode: input.strictMode ?? true,
      autoFix: input.autoFix ?? false,
      maxIssues: input.maxIssues ?? 1000
    };

    const staticAnalyzer = new StaticAnalyzer(config);
    
    // Add framework-specific rules based on detected or specified framework
    const frameworkAnalyzers = new Map<string, any>([
      ['nextjs', NextJSAnalyzer],
      ['vue', VueAnalyzer],
      ['react', ReactAnalyzer]
    ]);

    // Add rules for specified framework
    if (input.framework) {
      const AnalyzerClass = frameworkAnalyzers.get(input.framework);
      if (AnalyzerClass) {
        const analyzer = new AnalyzerClass();
        analyzer.getRules().forEach((rule: any) => staticAnalyzer.addRule(rule));
      }
    } else {
      // Auto-detect and add all relevant framework rules
      const detectedFrameworks = await staticAnalyzer.detectFrameworks(context);
      
      for (const framework of detectedFrameworks) {
        const AnalyzerClass = frameworkAnalyzers.get(framework);
        if (AnalyzerClass) {
          const analyzer = new AnalyzerClass();
          analyzer.getRules().forEach((rule: any) => staticAnalyzer.addRule(rule));
        }
      }
      
      // If Next.js is detected, also add React rules
      if (detectedFrameworks.includes('nextjs')) {
        const reactAnalyzer = new ReactAnalyzer();
        reactAnalyzer.getRules().forEach((rule: any) => staticAnalyzer.addRule(rule));
      }
    }

    // Add dependency analysis rules if requested
    if (input.analyzeDependencies !== false) {
      const depAnalyzer = new DependencyAnalyzer();
      depAnalyzer.getRules().forEach((rule: any) => staticAnalyzer.addRule(rule));
    }

    // Run static analysis
    const analysisResults = await staticAnalyzer.analyze(context);
    
    // Predict errors if requested
    let predictions: any[] = [];
    if (input.predictErrors !== false) {
      const errorPredictor = new ErrorPredictor();
      const errorPredictions = await errorPredictor.predictErrors(context);
      predictions = errorPredictions;
      
      // Convert predictions to analysis results
      const predictionResults = errorPredictor.convertToAnalysisResults(errorPredictions);
      analysisResults.push(...predictionResults);
    }

    // Generate report
    const report = await staticAnalyzer.generateReport(analysisResults);
    
    // Add error predictions to report if available
    let fullReport = report;
    if (predictions.length > 0) {
      const errorPredictor = new ErrorPredictor();
      const predictionReport = await errorPredictor.generatePredictionReport(predictions);
      fullReport = `${report}\n\n${predictionReport}`;
    }

    // Apply auto-fixes if requested
    let fixes: any = {};
    if (input.autoFix) {
      const autoFixes = await staticAnalyzer.autoFix(analysisResults);
      fixes = Object.fromEntries(autoFixes);
    }

    const duration = Date.now() - startTime;
    
    logger.info('Static analysis completed', {
      duration,
      issuesFound: analysisResults.length,
      predictions: predictions.length,
      autoFixes: Object.keys(fixes).length
    });

    return {
      content: [{
        type: 'text',
        text: fullReport
      }],
      metadata: {
        duration,
        issuesFound: analysisResults.length,
        errors: analysisResults.filter(r => r.severity === 'error').length,
        warnings: analysisResults.filter(r => r.severity === 'warning').length,
        predictions: predictions.length,
        autoFixes: fixes
      }
    };

  } catch (error) {
    logger.error('Static analysis failed', error as Error);
    return {
      content: [{
        type: 'text',
        text: `❌ Static analysis failed: ${(error as Error).message}`
      }],
      isError: true
    };
  }
}

/**
 * Handles quick validation of code snippets without requiring a full project context.
 * Creates temporary files for analysis and provides rapid feedback for development workflows.
 * 
 * @param input - Quick validation configuration
 * @param input.code - Source code string to validate
 * @param input.language - Programming language (typescript, javascript, jsx, tsx)
 * @param input.framework - Target framework for specialized validation rules
 * @param input.fileName - Optional filename for context (affects rule selection)
 * @returns Promise resolving to validation results with concise issue reporting
 * 
 * @example
 * ```typescript
 * const result = await handleQuickValidateTool({
 *   code: 'const x = useState();',
 *   language: 'tsx',
 *   framework: 'react'
 * });
 * console.log(result.metadata.valid); // false - missing React import
 * ```
 */
export async function handleQuickValidateTool(input: QuickValidateInput): Promise<ToolCallResult> {
  try {
    logger.info('Quick validation requested', {
      language: input.language,
      framework: input.framework,
      codeLength: input.code.length
    });

    // Create temporary context
    const tempDir = await fs.mkdtemp('/tmp/fluorite-validate-');
    const fileName = input.fileName || `temp.${input.language || 'ts'}`;
    const filePath = path.join(tempDir, fileName);
    
    await fs.writeFile(filePath, input.code);

    const context: AnalysisContext = {
      projectPath: tempDir,
      framework: input.framework,
      targetFiles: [filePath]
    };

    // Initialize analyzer with quick validation config
    const config: StaticAnalyzerConfig = {
      strictMode: true,
      maxIssues: 50
    };

    const analyzer = new StaticAnalyzer(config);
    
    // Add framework-specific rules
    const frameworkAnalyzers = new Map<string, any>([
      ['nextjs', NextJSAnalyzer],
      ['vue', VueAnalyzer],
      ['react', ReactAnalyzer]
    ]);

    if (input.framework) {
      const AnalyzerClass = frameworkAnalyzers.get(input.framework);
      if (AnalyzerClass) {
        const frameworkAnalyzer = new AnalyzerClass();
        frameworkAnalyzer.getRules().forEach((rule: any) => analyzer.addRule(rule));
      }
      
      // Add React rules for Next.js
      if (input.framework === 'nextjs') {
        const reactAnalyzer = new ReactAnalyzer();
        reactAnalyzer.getRules().forEach((rule: any) => analyzer.addRule(rule));
      }
    }

    // Run analysis
    const results = await analyzer.analyze(context);
    
    // Also run error prediction
    const errorPredictor = new ErrorPredictor();
    const predictions = await errorPredictor.predictErrors(context);
    
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true });

    // Generate concise report
    const issues = results.filter(r => r.severity === 'error' || r.severity === 'warning');
    const report = [
      '🔍 Quick Validation Results:',
      `• Errors: ${results.filter(r => r.severity === 'error').length}`,
      `• Warnings: ${results.filter(r => r.severity === 'warning').length}`,
      `• Predicted Issues: ${predictions.filter(p => p.probability > 0.7).length}`,
      ''
    ];

    if (issues.length > 0) {
      report.push('Issues Found:');
      issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        report.push(`${icon} Line ${issue.line || '?'}: ${issue.message}`);
        if (issue.suggestion) {
          report.push(`   💡 ${issue.suggestion}`);
        }
      });
    } else {
      report.push('✅ No critical issues found!');
    }

    if (predictions.filter(p => p.probability > 0.7).length > 0) {
      report.push('', '⚠️ High-Risk Predictions:');
      predictions.filter(p => p.probability > 0.7).forEach(pred => {
        report.push(`• ${pred.type}: ${pred.message} (${(pred.probability * 100).toFixed(0)}%)`);
      });
    }

    return {
      content: [{
        type: 'text',
        text: report.join('\n')
      }],
      metadata: {
        valid: issues.filter(i => i.severity === 'error').length === 0,
        errorCount: results.filter(r => r.severity === 'error').length,
        warningCount: results.filter(r => r.severity === 'warning').length,
        highRiskPredictions: predictions.filter(p => p.probability > 0.7).length
      }
    };

  } catch (error) {
    logger.error('Quick validation failed', error as Error);
    return {
      content: [{
        type: 'text',
        text: `❌ Quick validation failed: ${(error as Error).message}`
      }],
      isError: true
    };
  }
}

/**
 * Handles real-time validation for live development environments with optimized
 * performance and minimal latency. Uses fast-running rules and limits issue count
 * for responsive IDE integration.
 * 
 * @param input - Real-time validation configuration
 * @param input.file - File path to validate
 * @param input.content - Optional file content (if not provided, reads from disk)
 * @param input.framework - Target framework for specialized rules
 * @param input.watchMode - Enable watch mode for continuous validation
 * @returns Promise resolving to real-time validation status and diagnostics
 * 
 * @example
 * ```typescript
 * const result = await handleRealTimeValidationTool({
 *   file: './src/components/Button.tsx',
 *   framework: 'react',
 *   watchMode: true
 * });
 * console.log(result.metadata.status); // 'pass' or 'fail'
 * ```
 */
export async function handleRealTimeValidationTool(input: RealTimeValidationInput): Promise<ToolCallResult> {
  try {
    logger.info('Real-time validation requested', {
      file: input.file,
      framework: input.framework,
      watchMode: input.watchMode
    });

    // Read file content if not provided
    const content = input.content || await fs.readFile(input.file, 'utf-8');
    
    // Create context
    const context: AnalysisContext = {
      projectPath: path.dirname(input.file),
      framework: input.framework,
      targetFiles: [input.file]
    };

    // Initialize analyzer for real-time validation
    const config: StaticAnalyzerConfig = {
      strictMode: false, // Less strict for real-time
      maxIssues: 20 // Limit issues for performance
    };

    const analyzer = new StaticAnalyzer(config);
    
    // Add only fast-running rules for real-time validation
    const frameworkAnalyzers = new Map<string, any>([
      ['nextjs', NextJSAnalyzer],
      ['vue', VueAnalyzer],
      ['react', ReactAnalyzer]
    ]);

    if (input.framework) {
      const AnalyzerClass = frameworkAnalyzers.get(input.framework);
      if (AnalyzerClass) {
        const frameworkAnalyzer = new AnalyzerClass();
        // Filter for fast rules only (exclude config and dependency analysis)
        const fastRules = frameworkAnalyzer.getRules().filter((rule: any) => 
          !['nextjs-config', 'vue-config', 'dependency-analysis'].includes(rule.id)
        );
        fastRules.forEach((rule: any) => analyzer.addRule(rule));
      }
      
      // Add React rules for Next.js
      if (input.framework === 'nextjs') {
        const reactAnalyzer = new ReactAnalyzer();
        const fastReactRules = reactAnalyzer.getRules().filter(rule => 
          !rule.id.includes('config')
        );
        fastReactRules.forEach((rule: any) => analyzer.addRule(rule));
      }
    }

    // Run analysis
    const startTime = Date.now();
    const results = await analyzer.analyze(context);
    const duration = Date.now() - startTime;

    // Format for real-time display
    const criticalIssues = results.filter(r => r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');

    let status = '✅';
    let message = 'No issues detected';
    
    if (criticalIssues.length > 0) {
      status = '❌';
      message = `${criticalIssues.length} error(s)`;
    } else if (warnings.length > 0) {
      status = '⚠️';
      message = `${warnings.length} warning(s)`;
    }

    const diagnostics = results.map(r => ({
      line: r.line || 0,
      column: r.column || 0,
      severity: r.severity,
      message: r.message,
      suggestion: r.suggestion
    }));

    return {
      content: [{
        type: 'text',
        text: `${status} ${input.file}: ${message} (validated in ${duration}ms)`
      }],
      metadata: {
        file: input.file,
        status: criticalIssues.length === 0 ? 'pass' : 'fail',
        duration,
        diagnostics
      }
    };

  } catch (error) {
    logger.error('Real-time validation failed', error as Error);
    return {
      content: [{
        type: 'text',
        text: `❌ Real-time validation failed: ${(error as Error).message}`
      }],
      isError: true
    };
  }
}

/**
 * Retrieves comprehensive list of all available validation rules across all analyzers
 * including framework-specific rules, built-in static analysis rules, and dependency
 * analysis rules. Useful for rule discovery and configuration.
 * 
 * @returns Promise resolving to tool result with complete rule catalog
 * 
 * @example
 * ```typescript
 * const result = await handleGetValidationRulesTool();
 * console.log(result.metadata.totalRules); // Total number of available rules
 * console.log(result.metadata.rules); // Array of rule objects with metadata
 * ```
 */
export async function handleGetValidationRulesTool(): Promise<ToolCallResult> {
  try {
    const analyzer = new StaticAnalyzer();
    const nextjsAnalyzer = new NextJSAnalyzer();
    const vueAnalyzer = new VueAnalyzer();
    const reactAnalyzer = new ReactAnalyzer();
    const depAnalyzer = new DependencyAnalyzer();
    
    const allRules = [
      ...Array.from((analyzer as any).rules.values()),
      ...nextjsAnalyzer.getRules(),
      ...vueAnalyzer.getRules(),
      ...reactAnalyzer.getRules(),
      ...depAnalyzer.getRules()
    ];

    const ruleList = allRules.map((rule: any) => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      severity: rule.severity,
      category: rule.category,
      frameworks: rule.frameworks || ['all']
    }));

    const report = [
      '📋 Available Validation Rules:',
      '',
      ...ruleList.map(rule => 
        `• ${rule.id}: ${rule.name}\n  ${rule.description}\n  Severity: ${rule.severity} | Category: ${rule.category} | Frameworks: ${rule.frameworks.join(', ')}`
      )
    ];

    return {
      content: [{
        type: 'text',
        text: report.join('\n')
      }],
      metadata: {
        totalRules: ruleList.length,
        rules: ruleList
      }
    };

  } catch (error) {
    logger.error('Failed to get validation rules', error as Error);
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to get validation rules: ${(error as Error).message}`
      }],
      isError: true
    };
  }
}

export default {
  handleStaticAnalysisTool,
  handleQuickValidateTool,
  handleRealTimeValidationTool,
  handleGetValidationRulesTool
};
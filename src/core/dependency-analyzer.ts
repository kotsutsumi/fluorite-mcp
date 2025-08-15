import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from './logger.js';
import { ValidationRule, AnalysisContext, AnalysisResult } from './static-analyzer.js';

const logger = createLogger('dependency-analyzer', 'fluorite-mcp');

export interface DependencyIssue {
  package: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  resolution?: string;
  conflictWith?: string[];
}

export interface ModuleResolution {
  module: string;
  resolved: boolean;
  path?: string;
  error?: string;
  suggestions?: string[];
}

export class DependencyAnalyzer {
  private knownIssues: Map<string, DependencyIssue[]> = new Map();
  private compatibilityMatrix: Map<string, Map<string, string>> = new Map();

  constructor() {
    this.initializeKnownIssues();
    this.initializeCompatibilityMatrix();
  }

  private initializeKnownIssues(): void {
    // Next.js specific issues
    this.knownIssues.set('next@13', [
      {
        package: 'react',
        issue: 'Requires React 18.2.0 or higher',
        severity: 'critical',
        resolution: 'npm install react@^18.2.0 react-dom@^18.2.0'
      }
    ]);

    this.knownIssues.set('next@14', [
      {
        package: 'react',
        issue: 'Requires React 18.2.0 or higher',
        severity: 'critical',
        resolution: 'npm install react@^18.2.0 react-dom@^18.2.0'
      },
      {
        package: 'typescript',
        issue: 'Requires TypeScript 5.0 or higher for best support',
        severity: 'medium',
        resolution: 'npm install --save-dev typescript@^5.0.0'
      }
    ]);

    // React ecosystem issues
    this.knownIssues.set('react@18', [
      {
        package: 'react-dom',
        issue: 'Version mismatch with react-dom',
        severity: 'critical',
        resolution: 'Ensure react and react-dom versions match'
      }
    ]);
  }

  private initializeCompatibilityMatrix(): void {
    // Next.js compatibility
    const nextCompat = new Map<string, string>();
    nextCompat.set('react', '>=18.2.0');
    nextCompat.set('react-dom', '>=18.2.0');
    nextCompat.set('typescript', '>=5.0.0');
    nextCompat.set('eslint', '>=8.0.0');
    this.compatibilityMatrix.set('next@14', nextCompat);

    const next13Compat = new Map<string, string>();
    next13Compat.set('react', '>=18.2.0');
    next13Compat.set('react-dom', '>=18.2.0');
    next13Compat.set('typescript', '>=4.5.4');
    this.compatibilityMatrix.set('next@13', next13Compat);
  }

  public async analyzeDependencies(context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    try {
      // Check for missing dependencies
      const missingDeps = await this.checkMissingDependencies(context);
      results.push(...missingDeps);

      // Check for version conflicts
      const versionConflicts = await this.checkVersionConflicts(context);
      results.push(...versionConflicts);

      // Check for security vulnerabilities
      const securityIssues = await this.checkSecurityVulnerabilities(context);
      results.push(...securityIssues);

      // Check for peer dependency issues
      const peerDepIssues = await this.checkPeerDependencies(context);
      results.push(...peerDepIssues);

      // Check for circular dependencies
      const circularDeps = await this.checkCircularDependencies(context);
      results.push(...circularDeps);

      // Check for duplicate packages
      const duplicates = await this.checkDuplicatePackages(context);
      results.push(...duplicates);

    } catch (error) {
      logger.error('Dependency analysis failed', error as Error);
    }

    return results;
  }

  private async checkMissingDependencies(context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    if (!context.targetFiles) return results;

    for (const file of context.targetFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check import statements
        const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          
          // Skip relative imports
          if (importPath.startsWith('.') || importPath.startsWith('/')) continue;
          
          // Check if it's a Node.js built-in module
          const nodeBuiltins = ['fs', 'path', 'http', 'https', 'crypto', 'util', 'stream', 'os'];
          if (nodeBuiltins.includes(importPath)) continue;
          
          // Extract package name (handle scoped packages)
          const packageName = importPath.startsWith('@') 
            ? importPath.split('/').slice(0, 2).join('/')
            : importPath.split('/')[0];
          
          // Check if package exists in dependencies
          const deps = { ...context.dependencies, ...context.devDependencies };
          if (!deps[packageName]) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            results.push({
              severity: 'error',
              category: 'dependencies',
              message: `Missing dependency: '${packageName}'`,
              file,
              line: lineNum,
              suggestion: `Run: npm install ${packageName}`,
              confidence: 0.95,
              rule: 'missing-dependency'
            });
          }
        }
      } catch (error) {
        logger.warn(`Could not analyze file ${file}`, error as Error);
      }
    }

    return results;
  }

  private async checkVersionConflicts(context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    // Check framework-specific compatibility
    for (const [framework, compatMap] of this.compatibilityMatrix) {
      const frameworkPkg = framework.split('@')[0];
      const frameworkVersion = context.dependencies?.[frameworkPkg] || context.devDependencies?.[frameworkPkg];
      
      if (frameworkVersion) {
        for (const [dep, requiredVersion] of compatMap) {
          const installedVersion = context.dependencies?.[dep] || context.devDependencies?.[dep];
          
          if (installedVersion && !this.versionSatisfies(installedVersion, requiredVersion)) {
            results.push({
              severity: 'error',
              category: 'dependencies',
              message: `Version conflict: ${dep}@${installedVersion} incompatible with ${framework}`,
              file: 'package.json',
              suggestion: `Update to ${dep}@${requiredVersion}`,
              confidence: 0.9,
              rule: 'version-conflict'
            });
          }
        }
      }
    }

    return results;
  }

  private async checkSecurityVulnerabilities(context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    // Known vulnerable versions (simplified for example)
    const vulnerablePackages = new Map([
      ['lodash', { below: '4.17.21', severity: 'high', cve: 'CVE-2021-23337' }],
      ['minimist', { below: '1.2.6', severity: 'critical', cve: 'CVE-2021-44906' }],
      ['axios', { below: '0.21.2', severity: 'high', cve: 'CVE-2021-3749' }],
      ['node-fetch', { below: '2.6.7', severity: 'high', cve: 'CVE-2022-0235' }]
    ]);

    const allDeps = { ...context.dependencies, ...context.devDependencies };
    
    for (const [pkg, version] of Object.entries(allDeps)) {
      const vuln = vulnerablePackages.get(pkg);
      if (vuln) {
        const cleanVersion = version.replace(/[\^~]/, '');
        if (this.versionCompare(cleanVersion, vuln.below) < 0) {
          results.push({
            severity: 'error',
            category: 'security',
            message: `Security vulnerability in ${pkg}@${version} (${vuln.cve})`,
            file: 'package.json',
            suggestion: `Update to ${pkg}@>=${vuln.below}`,
            confidence: 1.0,
            rule: 'security-vulnerability'
          });
        }
      }
    }

    return results;
  }

  private async checkPeerDependencies(context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    // Common peer dependency requirements
    const peerDependencyMap = new Map([
      ['react-dom', { requires: ['react'] }],
      ['@types/react-dom', { requires: ['@types/react'] }],
      ['next', { requires: ['react', 'react-dom'] }],
      ['@testing-library/react', { requires: ['react', 'react-dom'] }]
    ]);

    const allDeps = { ...context.dependencies, ...context.devDependencies };
    
    for (const [pkg, requirements] of peerDependencyMap) {
      if (allDeps[pkg]) {
        for (const required of requirements.requires) {
          if (!allDeps[required]) {
            results.push({
              severity: 'error',
              category: 'dependencies',
              message: `Missing peer dependency: ${required} required by ${pkg}`,
              file: 'package.json',
              suggestion: `Install ${required}: npm install ${required}`,
              confidence: 0.95,
              rule: 'peer-dependency'
            });
          }
        }
      }
    }

    return results;
  }

  private async checkCircularDependencies(context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    if (!context.targetFiles) return results;

    const dependencyGraph = new Map<string, Set<string>>();
    
    // Build dependency graph
    for (const file of context.targetFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const imports = new Set<string>();
        
        const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          if (importPath.startsWith('.')) {
            const resolvedPath = path.resolve(path.dirname(file), importPath);
            imports.add(resolvedPath);
          }
        }
        
        dependencyGraph.set(file, imports);
      } catch (error) {
        logger.debug(`Could not analyze file ${file}`, error as Error);
      }
    }

    // Detect cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (node: string, path: string[] = []): string[] | null => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const dependencies = dependencyGraph.get(node) || new Set();
      for (const dep of dependencies) {
        if (!visited.has(dep)) {
          const cycle = hasCycle(dep, [...path]);
          if (cycle) return cycle;
        } else if (recursionStack.has(dep)) {
          return [...path, dep];
        }
      }
      
      recursionStack.delete(node);
      return null;
    };

    for (const file of dependencyGraph.keys()) {
      if (!visited.has(file)) {
        const cycle = hasCycle(file);
        if (cycle) {
          results.push({
            severity: 'warning',
            category: 'dependencies',
            message: `Circular dependency detected: ${cycle.map(f => path.basename(f)).join(' → ')}`,
            file: cycle[0],
            suggestion: 'Refactor to remove circular dependency',
            confidence: 0.9,
            rule: 'circular-dependency'
          });
        }
      }
    }

    return results;
  }

  private async checkDuplicatePackages(context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    // Check for packages in both dependencies and devDependencies
    if (context.dependencies && context.devDependencies) {
      for (const pkg of Object.keys(context.dependencies)) {
        if (context.devDependencies[pkg]) {
          results.push({
            severity: 'warning',
            category: 'dependencies',
            message: `Package '${pkg}' appears in both dependencies and devDependencies`,
            file: 'package.json',
            suggestion: 'Remove from devDependencies if needed in production',
            confidence: 1.0,
            rule: 'duplicate-package'
          });
        }
      }
    }

    return results;
  }

  public async resolveModules(context: AnalysisContext, modules: string[]): Promise<ModuleResolution[]> {
    const resolutions: ModuleResolution[] = [];
    
    for (const module of modules) {
      const resolution: ModuleResolution = {
        module,
        resolved: false
      };

      try {
        // Try to resolve from node_modules
        const modulePath = path.join(context.projectPath, 'node_modules', module);
        await fs.access(modulePath);
        
        resolution.resolved = true;
        resolution.path = modulePath;
      } catch {
        resolution.error = `Module '${module}' not found`;
        resolution.suggestions = [
          `npm install ${module}`,
          `yarn add ${module}`,
          `Check if module name is correct`
        ];
      }

      resolutions.push(resolution);
    }

    return resolutions;
  }

  private versionSatisfies(installed: string, required: string): boolean {
    // Simplified version checking (in production, use semver library)
    const cleanInstalled = installed.replace(/[\^~]/, '');
    const cleanRequired = required.replace(/[><=]/, '');
    
    return this.versionCompare(cleanInstalled, cleanRequired) >= 0;
  }

  private versionCompare(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }

  public getRules(): ValidationRule[] {
    return [
      {
        id: 'dependency-analysis',
        name: 'Comprehensive Dependency Analysis',
        description: 'Analyzes all dependency-related issues',
        severity: 'error',
        category: 'dependencies',
        validate: async (context) => {
          return await this.analyzeDependencies(context);
        }
      }
    ];
  }
}

export default DependencyAnalyzer;
import { ValidationRule, AnalysisContext, AnalysisResult } from './static-analyzer.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('nextjs-analyzer', 'fluorite-mcp');

export class NextJSAnalyzer {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Next.js App Router validation
    this.rules.push({
      id: 'nextjs-app-router-structure',
      name: 'Next.js App Router Structure Validation',
      description: 'Validates proper App Router structure and conventions',
      severity: 'error',
      category: 'nextjs-structure',
      frameworks: ['nextjs'],
      filePatterns: [/app\/.*\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for proper layout/page structure
        if (filePath.includes('/app/') && !filePath.match(/(layout|page|loading|error|not-found|route|template)\.(tsx|jsx|ts|js)$/)) {
          const fileName = path.basename(filePath);
          if (!fileName.startsWith('_') && !fileName.match(/\.(css|scss|module\.css)$/)) {
            results.push({
              severity: 'warning',
              category: 'nextjs-structure',
              message: `File '${fileName}' in app directory doesn't follow Next.js naming conventions`,
              file: filePath,
              suggestion: 'Use standard Next.js file names: page, layout, loading, error, not-found, route, or template',
              confidence: 0.8,
              framework: 'nextjs',
              rule: 'nextjs-app-router-structure'
            });
          }
        }

        // Check for metadata export in page/layout files
        if (filePath.match(/(page|layout)\.(tsx|jsx|ts|js)$/)) {
          if (!content.includes('export const metadata') && !content.includes('export async function generateMetadata')) {
            results.push({
              severity: 'warning',
              category: 'nextjs-seo',
              message: 'Missing metadata export for SEO optimization',
              file: filePath,
              suggestion: 'Add metadata export or generateMetadata function for better SEO',
              confidence: 0.7,
              framework: 'nextjs',
              rule: 'nextjs-app-router-structure'
            });
          }
        }

        return results;
      }
    });

    // Next.js Server Components validation
    this.rules.push({
      id: 'nextjs-server-components',
      name: 'Next.js Server Components Validation',
      description: 'Validates proper use of Server and Client Components',
      severity: 'error',
      category: 'nextjs-components',
      frameworks: ['nextjs'],
      filePatterns: [/\.(tsx|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        const hasUseClient = content.match(/^['"]use client['"]/m);
        const hasUseServer = content.match(/^['"]use server['"]/m);
        
        // Check for client-only features in server components
        if (!hasUseClient && !hasUseServer) {
          // Server component by default
          const clientOnlyHooks = [
            'useState', 'useEffect', 'useLayoutEffect', 'useReducer',
            'useCallback', 'useMemo', 'useRef', 'useImperativeHandle'
          ];
          
          for (const hook of clientOnlyHooks) {
            if (content.includes(hook)) {
              const lineNum = content.split('\n').findIndex(line => line.includes(hook)) + 1;
              results.push({
                severity: 'error',
                category: 'nextjs-components',
                message: `Using client-side hook '${hook}' in a Server Component`,
                file: filePath,
                line: lineNum,
                suggestion: `Add 'use client' directive at the top of the file to make it a Client Component`,
                autoFix: `'use client';\n\n${content}`,
                confidence: 1.0,
                framework: 'nextjs',
                rule: 'nextjs-server-components'
              });
            }
          }

          // Check for event handlers in server components
          const eventHandlerRegex = /on[A-Z]\w+\s*=\s*{/g;
          if (eventHandlerRegex.test(content)) {
            results.push({
              severity: 'error',
              category: 'nextjs-components',
              message: 'Event handlers detected in Server Component',
              file: filePath,
              suggestion: `Add 'use client' directive for components with event handlers`,
              confidence: 0.9,
              framework: 'nextjs',
              rule: 'nextjs-server-components'
            });
          }
        }

        // Check for server-only code in client components
        if (hasUseClient) {
          const serverOnlyPatterns = [
            /import.*from\s+['"]fs['"]/,
            /import.*from\s+['"]path['"]/,
            /import.*from\s+['"]crypto['"]/,
            /process\.env\./,
            /require\(['"]fs['"]\)/
          ];

          for (const pattern of serverOnlyPatterns) {
            if (pattern.test(content)) {
              results.push({
                severity: 'error',
                category: 'nextjs-components',
                message: 'Server-only code detected in Client Component',
                file: filePath,
                suggestion: 'Move server-only code to Server Components or API routes',
                confidence: 0.95,
                framework: 'nextjs',
                rule: 'nextjs-server-components'
              });
            }
          }
        }

        return results;
      }
    });

    // Next.js Image Optimization
    this.rules.push({
      id: 'nextjs-image-optimization',
      name: 'Next.js Image Optimization',
      description: 'Ensures proper use of Next.js Image component',
      severity: 'warning',
      category: 'nextjs-performance',
      frameworks: ['nextjs'],
      filePatterns: [/\.(tsx|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for native img tags instead of Next.js Image
        const imgTagRegex = /<img\s+[^>]*src=/g;
        if (imgTagRegex.test(content)) {
          const lineNum = content.split('\n').findIndex(line => line.match(/<img\s+/)) + 1;
          results.push({
            severity: 'warning',
            category: 'nextjs-performance',
            message: 'Using native <img> tag instead of Next.js Image component',
            file: filePath,
            line: lineNum,
            suggestion: "Import and use 'next/image' for automatic image optimization",
            confidence: 0.85,
            framework: 'nextjs',
            rule: 'nextjs-image-optimization'
          });
        }

        // Check for missing width/height on Image components
        const imageComponentRegex = /<Image\s+([^>]*)\/>/g;
        let match;
        while ((match = imageComponentRegex.exec(content)) !== null) {
          const props = match[1];
          if (!props.includes('width') || !props.includes('height')) {
            if (!props.includes('fill')) {
              const lineNum = content.substring(0, match.index).split('\n').length;
              results.push({
                severity: 'warning',
                category: 'nextjs-performance',
                message: 'Image component missing width/height props',
                file: filePath,
                line: lineNum,
                suggestion: 'Add width and height props or use fill prop for responsive images',
                confidence: 0.9,
                framework: 'nextjs',
                rule: 'nextjs-image-optimization'
              });
            }
          }
        }

        return results;
      }
    });

    // Next.js API Routes validation
    this.rules.push({
      id: 'nextjs-api-routes',
      name: 'Next.js API Routes Validation',
      description: 'Validates API route handlers and conventions',
      severity: 'error',
      category: 'nextjs-api',
      frameworks: ['nextjs'],
      filePatterns: [/app\/api\/.*route\.(ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for proper HTTP method exports
        const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
        const exportedMethods = httpMethods.filter(method => 
          content.includes(`export async function ${method}`) || 
          content.includes(`export function ${method}`)
        );

        if (exportedMethods.length === 0) {
          results.push({
            severity: 'error',
            category: 'nextjs-api',
            message: 'API route missing HTTP method handlers',
            file: filePath,
            suggestion: 'Export functions named after HTTP methods (GET, POST, etc.)',
            confidence: 1.0,
            framework: 'nextjs',
            rule: 'nextjs-api-routes'
          });
        }

        // Check for proper response handling
        for (const method of exportedMethods) {
          const methodRegex = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}[^{]*{([^}]*)}`, 's');
          const methodMatch = content.match(methodRegex);
          
          if (methodMatch) {
            const methodBody = methodMatch[1];
            
            // Check for Response or NextResponse usage
            if (!methodBody.includes('Response') && !methodBody.includes('NextResponse')) {
              results.push({
                severity: 'error',
                category: 'nextjs-api',
                message: `API handler ${method} doesn't return a Response object`,
                file: filePath,
                suggestion: 'Return Response or NextResponse object from API handlers',
                confidence: 0.9,
                framework: 'nextjs',
                rule: 'nextjs-api-routes'
              });
            }

            // Check for error handling
            if (!methodBody.includes('try') && !methodBody.includes('catch')) {
              results.push({
                severity: 'warning',
                category: 'nextjs-api',
                message: `API handler ${method} lacks error handling`,
                file: filePath,
                suggestion: 'Add try-catch blocks for proper error handling',
                confidence: 0.8,
                framework: 'nextjs',
                rule: 'nextjs-api-routes'
              });
            }
          }
        }

        return results;
      }
    });

    // Next.js Environment Variables
    this.rules.push({
      id: 'nextjs-env-vars',
      name: 'Next.js Environment Variables Validation',
      description: 'Validates proper use of environment variables',
      severity: 'error',
      category: 'nextjs-security',
      frameworks: ['nextjs'],
      filePatterns: [/\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for direct process.env usage in client components
        const hasUseClient = content.match(/^['"]use client['"]/m);
        if (hasUseClient) {
          const envVarRegex = /process\.env\.(\w+)/g;
          let match;
          
          while ((match = envVarRegex.exec(content)) !== null) {
            const envVar = match[1];
            if (!envVar.startsWith('NEXT_PUBLIC_')) {
              const lineNum = content.substring(0, match.index).split('\n').length;
              results.push({
                severity: 'error',
                category: 'nextjs-security',
                message: `Non-public environment variable '${envVar}' accessed in Client Component`,
                file: filePath,
                line: lineNum,
                suggestion: `Prefix with NEXT_PUBLIC_ to expose to client or move to Server Component`,
                confidence: 1.0,
                framework: 'nextjs',
                rule: 'nextjs-env-vars'
              });
            }
          }
        }

        return results;
      }
    });

    // Next.js Dynamic Imports
    this.rules.push({
      id: 'nextjs-dynamic-imports',
      name: 'Next.js Dynamic Import Optimization',
      description: 'Suggests dynamic imports for performance',
      severity: 'info',
      category: 'nextjs-performance',
      frameworks: ['nextjs'],
      filePatterns: [/\.(tsx|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for large component imports that could be dynamic
        const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const componentName = match[1];
          const importPath = match[2];
          
          // Suggest dynamic import for heavy libraries
          const heavyLibraries = ['recharts', 'react-player', 'monaco-editor', '@monaco-editor', 'codemirror'];
          if (heavyLibraries.some(lib => importPath.includes(lib))) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            results.push({
              severity: 'info',
              category: 'nextjs-performance',
              message: `Consider dynamic import for heavy library '${importPath}'`,
              file: filePath,
              line: lineNum,
              suggestion: `Use next/dynamic for code splitting: const ${componentName} = dynamic(() => import('${importPath}'))`,
              confidence: 0.7,
              framework: 'nextjs',
              rule: 'nextjs-dynamic-imports'
            });
          }
        }

        return results;
      }
    });

    // Next.js Configuration Validation
    this.rules.push({
      id: 'nextjs-config',
      name: 'Next.js Configuration Validation',
      description: 'Validates next.config.js settings',
      severity: 'warning',
      category: 'nextjs-config',
      frameworks: ['nextjs'],
      validate: async (context) => {
        const results: AnalysisResult[] = [];
        
        try {
          const configPath = path.join(context.projectPath, 'next.config.js');
          const configContent = await fs.readFile(configPath, 'utf-8');
          
          // Check for experimental features
          if (configContent.includes('experimental:')) {
            results.push({
              severity: 'warning',
              category: 'nextjs-config',
              message: 'Using experimental Next.js features',
              file: 'next.config.js',
              suggestion: 'Experimental features may change or be removed in future versions',
              confidence: 1.0,
              framework: 'nextjs',
              rule: 'nextjs-config'
            });
          }

          // Check for missing optimization settings
          if (!configContent.includes('images:')) {
            results.push({
              severity: 'info',
              category: 'nextjs-config',
              message: 'Missing image optimization configuration',
              file: 'next.config.js',
              suggestion: 'Configure image domains and optimization settings',
              confidence: 0.6,
              framework: 'nextjs',
              rule: 'nextjs-config'
            });
          }

          // Check for security headers
          if (!configContent.includes('headers')) {
            results.push({
              severity: 'warning',
              category: 'nextjs-security',
              message: 'Missing security headers configuration',
              file: 'next.config.js',
              suggestion: 'Add security headers like CSP, X-Frame-Options, etc.',
              confidence: 0.7,
              framework: 'nextjs',
              rule: 'nextjs-config'
            });
          }
        } catch (error) {
          logger.debug('Could not analyze next.config.js', error as Error);
        }

        return results;
      }
    });

    // Next.js Data Fetching Patterns
    this.rules.push({
      id: 'nextjs-data-fetching',
      name: 'Next.js Data Fetching Best Practices',
      description: 'Validates data fetching patterns',
      severity: 'warning',
      category: 'nextjs-data',
      frameworks: ['nextjs'],
      filePatterns: [/app\/.*\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for fetch without cache configuration
        const fetchRegex = /fetch\s*\([^)]*\)/g;
        let match;
        
        while ((match = fetchRegex.exec(content)) !== null) {
          const fetchCall = match[0];
          if (!fetchCall.includes('cache:') && !fetchCall.includes('revalidate')) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            results.push({
              severity: 'info',
              category: 'nextjs-data',
              message: 'Fetch call without explicit cache configuration',
              file: filePath,
              line: lineNum,
              suggestion: "Add cache: 'force-cache' or revalidate option for optimal caching",
              confidence: 0.6,
              framework: 'nextjs',
              rule: 'nextjs-data-fetching'
            });
          }
        }

        // Check for client-side data fetching in Server Components
        if (!content.includes('use client')) {
          if (content.includes('useEffect') && content.includes('fetch')) {
            results.push({
              severity: 'warning',
              category: 'nextjs-data',
              message: 'Client-side data fetching pattern in Server Component',
              file: filePath,
              suggestion: 'Use async Server Components for data fetching instead of useEffect',
              confidence: 0.8,
              framework: 'nextjs',
              rule: 'nextjs-data-fetching'
            });
          }
        }

        return results;
      }
    });

    // Next.js Middleware Validation
    this.rules.push({
      id: 'nextjs-middleware',
      name: 'Next.js Middleware Validation',
      description: 'Validates middleware implementation',
      severity: 'error',
      category: 'nextjs-middleware',
      frameworks: ['nextjs'],
      filePatterns: [/middleware\.(ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for middleware export
        if (!content.includes('export function middleware') && !content.includes('export default function')) {
          results.push({
            severity: 'error',
            category: 'nextjs-middleware',
            message: 'Middleware file missing middleware function export',
            file: filePath,
            suggestion: 'Export a middleware function',
            confidence: 1.0,
            framework: 'nextjs',
            rule: 'nextjs-middleware'
          });
        }

        // Check for config export
        if (!content.includes('export const config')) {
          results.push({
            severity: 'warning',
            category: 'nextjs-middleware',
            message: 'Middleware missing matcher configuration',
            file: filePath,
            suggestion: 'Add export const config with matcher patterns',
            confidence: 0.8,
            framework: 'nextjs',
            rule: 'nextjs-middleware'
          });
        }

        // Check for heavy operations in middleware
        const heavyOperations = ['await fetch', 'JSON.parse', 'JSON.stringify'];
        for (const op of heavyOperations) {
          if (content.includes(op)) {
            results.push({
              severity: 'warning',
              category: 'nextjs-performance',
              message: `Heavy operation '${op}' detected in middleware`,
              file: filePath,
              suggestion: 'Keep middleware lightweight for optimal performance',
              confidence: 0.7,
              framework: 'nextjs',
              rule: 'nextjs-middleware'
            });
          }
        }

        return results;
      }
    });
  }

  public getRules(): ValidationRule[] {
    return this.rules;
  }
}

export default NextJSAnalyzer;
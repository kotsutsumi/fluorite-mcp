import { ValidationRule, AnalysisContext, AnalysisResult } from './static-analyzer.js';
import { createLogger } from './logger.js';

const logger = createLogger('react-analyzer', 'fluorite-mcp');

/**
 * React-specific static analyzer that validates React component patterns, hooks usage,
 * performance optimizations, security practices, and testing patterns. Implements
 * comprehensive validation rules for React applications.
 * 
 * @example
 * ```typescript
 * const analyzer = new ReactAnalyzer();
 * const rules = analyzer.getRules();
 * console.log(rules.length); // Number of React validation rules
 * ```
 */
export class ReactAnalyzer {
  private rules: ValidationRule[] = [];

  /**
   * Creates a new React analyzer instance and initializes all validation rules.
   * Rules include hooks validation, state management, performance optimization,
   * component best practices, security checks, and testing patterns.
   */
  constructor() {
    this.initializeRules();
  }

  /**
   * Initializes all React validation rules including:
   * - React Hooks rules of hooks validation
   * - useEffect dependencies and cleanup validation
   * - State management patterns and mutation detection
   * - Performance optimization opportunities
   * - Component best practices and naming conventions
   * - Context API usage patterns
   * - Form handling validation
   * - Security vulnerability detection
   * - Testing pattern validation
   * 
   * @private
   */
  private initializeRules(): void {
    // React Hooks Rules
    this.rules.push({
      id: 'react-hooks-rules',
      name: 'React Hooks Rules of Hooks',
      description: 'Enforces React Hooks rules',
      severity: 'error',
      category: 'react-hooks',
      frameworks: ['react'],
      filePatterns: [/\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for hooks in conditional statements
        const conditionalHookRegex = /if\s*\([^)]*\)\s*{[^}]*use[A-Z]\w+\s*\(/g;
        if (conditionalHookRegex.test(content)) {
          results.push({
            severity: 'error',
            category: 'react-hooks',
            message: 'React Hook called conditionally',
            file: filePath,
            suggestion: 'Hooks must be called at the top level, not conditionally',
            confidence: 0.95,
            framework: 'react',
            rule: 'react-hooks-rules'
          });
        }

        // Check for hooks in loops
        const loopHookRegex = /(?:for|while|do)\s*\([^)]*\)\s*{[^}]*use[A-Z]\w+\s*\(/g;
        if (loopHookRegex.test(content)) {
          results.push({
            severity: 'error',
            category: 'react-hooks',
            message: 'React Hook called in a loop',
            file: filePath,
            suggestion: 'Hooks must not be called inside loops',
            confidence: 0.95,
            framework: 'react',
            rule: 'react-hooks-rules'
          });
        }

        // Check for hooks in nested functions
        const nestedFunctionRegex = /function\s+\w+\s*\([^)]*\)\s*{[^}]*function\s+\w+\s*\([^)]*\)\s*{[^}]*use[A-Z]\w+/g;
        if (nestedFunctionRegex.test(content)) {
          results.push({
            severity: 'error',
            category: 'react-hooks',
            message: 'React Hook called in nested function',
            file: filePath,
            suggestion: 'Hooks must be called from React function components or custom hooks',
            confidence: 0.9,
            framework: 'react',
            rule: 'react-hooks-rules'
          });
        }

        // Check for custom hooks not starting with 'use'
        const customHookRegex = /function\s+([a-z]\w*)\s*\([^)]*\)\s*{[^}]*use[A-Z]\w+/g;
        let match;
        while ((match = customHookRegex.exec(content)) !== null) {
          const funcName = match[1];
          if (!funcName.startsWith('use')) {
            results.push({
              severity: 'error',
              category: 'react-hooks',
              message: `Function '${funcName}' uses hooks but doesn't start with 'use'`,
              file: filePath,
              suggestion: 'Custom hooks must start with "use" prefix',
              confidence: 0.95,
              framework: 'react',
              rule: 'react-hooks-rules'
            });
          }
        }

        return results;
      }
    });

    // useEffect Dependencies
    this.rules.push({
      id: 'react-effect-deps',
      name: 'React useEffect Dependencies',
      description: 'Validates useEffect dependencies',
      severity: 'warning',
      category: 'react-hooks',
      frameworks: ['react'],
      filePatterns: [/\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for missing dependencies array
        const effectWithoutDepsRegex = /useEffect\s*\(\s*\([^)]*\)\s*=>\s*{[^}]*}\s*\)/g;
        if (effectWithoutDepsRegex.test(content)) {
          results.push({
            severity: 'warning',
            category: 'react-hooks',
            message: 'useEffect without dependencies array',
            file: filePath,
            suggestion: 'Add dependencies array to prevent effect from running on every render',
            confidence: 0.9,
            framework: 'react',
            rule: 'react-effect-deps'
          });
        }

        // Check for async useEffect
        const asyncEffectRegex = /useEffect\s*\(\s*async\s+/g;
        if (asyncEffectRegex.test(content)) {
          results.push({
            severity: 'error',
            category: 'react-hooks',
            message: 'useEffect callback cannot be async',
            file: filePath,
            suggestion: 'Create async function inside useEffect or use separate async function',
            confidence: 1.0,
            framework: 'react',
            rule: 'react-effect-deps'
          });
        }

        // Check for missing cleanup in useEffect
        const effectWithTimerRegex = /useEffect\s*\([^)]*{[^}]*(setInterval|setTimeout|addEventListener)[^}]*}\s*,/g;
        let match;
        while ((match = effectWithTimerRegex.exec(content)) !== null) {
          const effectBody = match[0];
          if (!effectBody.includes('return')) {
            results.push({
              severity: 'warning',
              category: 'react-hooks',
              message: 'useEffect with timer/listener but no cleanup function',
              file: filePath,
              suggestion: 'Return cleanup function to clear timers/listeners',
              confidence: 0.8,
              framework: 'react',
              rule: 'react-effect-deps'
            });
          }
        }

        return results;
      }
    });

    // React State Management
    this.rules.push({
      id: 'react-state',
      name: 'React State Management',
      description: 'Validates state management patterns',
      severity: 'error',
      category: 'react-state',
      frameworks: ['react'],
      filePatterns: [/\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for direct state mutation
        const stateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g;
        let match;
        
        while ((match = stateRegex.exec(content)) !== null) {
          const stateName = match[1];
          // Check for direct mutations
          const mutationRegex = new RegExp(`${stateName}\\.(push|pop|shift|unshift|splice|sort|reverse)\\(`, 'g');
          if (mutationRegex.test(content)) {
            results.push({
              severity: 'error',
              category: 'react-state',
              message: `Direct mutation of state '${stateName}'`,
              file: filePath,
              suggestion: 'Create new array/object when updating state',
              confidence: 0.95,
              framework: 'react',
              rule: 'react-state'
            });
          }
        }

        // Check for stale closure in setState
        const setStateRegex = /set(\w+)\s*\(\s*\1/g;
        if (setStateRegex.test(content)) {
          results.push({
            severity: 'warning',
            category: 'react-state',
            message: 'Potential stale closure in setState',
            file: filePath,
            suggestion: 'Use functional update pattern: setState(prev => ...)',
            confidence: 0.7,
            framework: 'react',
            rule: 'react-state'
          });
        }

        // Check for excessive useState calls
        const useStateCount = (content.match(/useState/g) || []).length;
        if (useStateCount > 7) {
          results.push({
            severity: 'warning',
            category: 'react-state',
            message: `Too many useState calls (${useStateCount})`,
            file: filePath,
            suggestion: 'Consider using useReducer or extracting logic to custom hook',
            confidence: 0.6,
            framework: 'react',
            rule: 'react-state'
          });
        }

        return results;
      }
    });

    // React Performance
    this.rules.push({
      id: 'react-performance',
      name: 'React Performance Optimization',
      description: 'Detects performance issues',
      severity: 'warning',
      category: 'react-performance',
      frameworks: ['react'],
      filePatterns: [/\.(tsx|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for missing React.memo on functional components
        const funcComponentRegex = /(?:export\s+)?(?:const|function)\s+([A-Z]\w+)\s*(?::|=)[^{]*\([^)]*\)\s*(?::|=>)/g;
        let match;
        
        while ((match = funcComponentRegex.exec(content)) !== null) {
          const componentName = match[1];
          if (!content.includes(`memo(${componentName})`) && !content.includes(`React.memo(${componentName})`)) {
            if (componentName !== 'App' && componentName !== 'Root') {
              results.push({
                severity: 'info',
                category: 'react-performance',
                message: `Component '${componentName}' could benefit from React.memo`,
                file: filePath,
                suggestion: 'Consider wrapping with React.memo to prevent unnecessary re-renders',
                confidence: 0.5,
                framework: 'react',
                rule: 'react-performance'
              });
            }
          }
        }

        // Check for inline function props
        const inlineFunctionRegex = /<\w+[^>]*(?:onClick|onChange|onSubmit)=\{(?:\([^)]*\)\s*=>|function)/g;
        if (inlineFunctionRegex.test(content)) {
          results.push({
            severity: 'warning',
            category: 'react-performance',
            message: 'Inline function in props causes re-renders',
            file: filePath,
            suggestion: 'Use useCallback for event handlers',
            confidence: 0.7,
            framework: 'react',
            rule: 'react-performance'
          });
        }

        // Check for expensive operations in render
        if (content.includes('.map(') && content.includes('.filter(') && content.includes('.reduce(')) {
          results.push({
            severity: 'warning',
            category: 'react-performance',
            message: 'Multiple array operations in render',
            file: filePath,
            suggestion: 'Consider using useMemo for expensive computations',
            confidence: 0.6,
            framework: 'react',
            rule: 'react-performance'
          });
        }

        // Check for large lists without keys or virtualization
        const mapRegex = /\.map\s*\([^)]*\)\s*(?:=>|{)/g;
        const mapMatches = content.match(mapRegex) || [];
        if (mapMatches.length > 0) {
          mapMatches.forEach(() => {
            if (!content.includes('key=') && !content.includes('react-window') && !content.includes('react-virtualized')) {
              results.push({
                severity: 'warning',
                category: 'react-performance',
                message: 'Large list rendering without virtualization',
                file: filePath,
                suggestion: 'Consider virtual scrolling for large lists',
                confidence: 0.5,
                framework: 'react',
                rule: 'react-performance'
              });
            }
          });
        }

        return results;
      }
    });

    // React Component Best Practices
    this.rules.push({
      id: 'react-components',
      name: 'React Component Best Practices',
      description: 'Validates component patterns',
      severity: 'warning',
      category: 'react-components',
      frameworks: ['react'],
      filePatterns: [/\.(tsx|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for missing prop types or TypeScript props
        if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
          if (!content.includes('PropTypes') && !content.includes('interface') && !content.includes('type')) {
            results.push({
              severity: 'warning',
              category: 'react-components',
              message: 'Component missing prop type definitions',
              file: filePath,
              suggestion: 'Add PropTypes or use TypeScript for type safety',
              confidence: 0.7,
              framework: 'react',
              rule: 'react-components'
            });
          }
        }

        // Check for hardcoded strings that should be props
        const hardcodedStringRegex = />["'][A-Z][^"']{10,}["']</g;
        if (hardcodedStringRegex.test(content)) {
          results.push({
            severity: 'info',
            category: 'react-components',
            message: 'Hardcoded text in component',
            file: filePath,
            suggestion: 'Consider making hardcoded text configurable via props',
            confidence: 0.4,
            framework: 'react',
            rule: 'react-components'
          });
        }

        // Check for missing display name in HOCs
        if (content.includes('forwardRef') || content.includes('memo')) {
          if (!content.includes('displayName')) {
            results.push({
              severity: 'info',
              category: 'react-components',
              message: 'Component with HOC missing displayName',
              file: filePath,
              suggestion: 'Add displayName for better debugging',
              confidence: 0.6,
              framework: 'react',
              rule: 'react-components'
            });
          }
        }

        // Check for component file naming
        const componentRegex = /(?:export\s+default\s+)?(?:function|const)\s+([A-Z]\w+)/;
        const componentMatch = content.match(componentRegex);
        if (componentMatch) {
          const componentName = componentMatch[1];
          const fileName = filePath.split('/').pop()?.replace(/\.(tsx|jsx|ts|js)$/, '');
          if (fileName && fileName !== componentName && fileName !== 'index') {
            results.push({
              severity: 'warning',
              category: 'react-components',
              message: `Component name '${componentName}' doesn't match file name '${fileName}'`,
              file: filePath,
              suggestion: 'Component and file names should match',
              confidence: 0.7,
              framework: 'react',
              rule: 'react-components'
            });
          }
        }

        return results;
      }
    });

    // React Context Usage
    this.rules.push({
      id: 'react-context',
      name: 'React Context Best Practices',
      description: 'Validates Context API usage',
      severity: 'warning',
      category: 'react-context',
      frameworks: ['react'],
      filePatterns: [/\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for missing Context.Provider
        if (content.includes('createContext') && !content.includes('.Provider')) {
          results.push({
            severity: 'warning',
            category: 'react-context',
            message: 'Context created but Provider not found',
            file: filePath,
            suggestion: 'Wrap components with Context.Provider',
            confidence: 0.7,
            framework: 'react',
            rule: 'react-context'
          });
        }

        // Check for useContext without null check
        const useContextRegex = /const\s+(\w+)\s*=\s*useContext\(/g;
        let match;
        
        while ((match = useContextRegex.exec(content)) !== null) {
          const contextValue = match[1];
          const hasNullCheck = new RegExp(`if\\s*\\(!?${contextValue}\\)`).test(content) ||
                              new RegExp(`${contextValue}\\s*\\?`).test(content);
          
          if (!hasNullCheck) {
            results.push({
              severity: 'warning',
              category: 'react-context',
              message: `Context value '${contextValue}' used without null check`,
              file: filePath,
              suggestion: 'Check if context value exists before using',
              confidence: 0.6,
              framework: 'react',
              rule: 'react-context'
            });
          }
        }

        return results;
      }
    });

    // React Forms
    this.rules.push({
      id: 'react-forms',
      name: 'React Forms Best Practices',
      description: 'Validates form handling',
      severity: 'warning',
      category: 'react-forms',
      frameworks: ['react'],
      filePatterns: [/\.(tsx|jsx)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for uncontrolled inputs
        if (content.includes('<input') && !content.includes('value=') && !content.includes('defaultValue=')) {
          results.push({
            severity: 'warning',
            category: 'react-forms',
            message: 'Uncontrolled input detected',
            file: filePath,
            suggestion: 'Use controlled components with value and onChange',
            confidence: 0.7,
            framework: 'react',
            rule: 'react-forms'
          });
        }

        // Check for missing form validation
        if (content.includes('<form') && !content.includes('validate') && !content.includes('required')) {
          results.push({
            severity: 'info',
            category: 'react-forms',
            message: 'Form without validation',
            file: filePath,
            suggestion: 'Add form validation for better UX',
            confidence: 0.5,
            framework: 'react',
            rule: 'react-forms'
          });
        }

        // Check for missing preventDefault in form submit
        const onSubmitRegex = /onSubmit\s*=\s*{[^}]*}/g;
        let match;
        
        while ((match = onSubmitRegex.exec(content)) !== null) {
          const handler = match[0];
          if (!handler.includes('preventDefault')) {
            results.push({
              severity: 'warning',
              category: 'react-forms',
              message: 'Form submit handler might be missing preventDefault',
              file: filePath,
              suggestion: 'Call e.preventDefault() in form submit handler',
              confidence: 0.7,
              framework: 'react',
              rule: 'react-forms'
            });
          }
        }

        return results;
      }
    });

    // React Security
    this.rules.push({
      id: 'react-security',
      name: 'React Security Best Practices',
      description: 'Validates security practices',
      severity: 'error',
      category: 'react-security',
      frameworks: ['react'],
      filePatterns: [/\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for dangerouslySetInnerHTML
        if (content.includes('dangerouslySetInnerHTML')) {
          results.push({
            severity: 'warning',
            category: 'react-security',
            message: 'dangerouslySetInnerHTML can lead to XSS vulnerabilities',
            file: filePath,
            suggestion: 'Sanitize HTML content or avoid using dangerouslySetInnerHTML',
            confidence: 0.9,
            framework: 'react',
            rule: 'react-security'
          });
        }

        // Check for eval usage
        if (content.includes('eval(')) {
          results.push({
            severity: 'error',
            category: 'react-security',
            message: 'eval() usage detected - security risk',
            file: filePath,
            suggestion: 'Never use eval() - find safer alternatives',
            confidence: 1.0,
            framework: 'react',
            rule: 'react-security'
          });
        }

        // Check for localStorage with sensitive data
        if (content.includes('localStorage.setItem')) {
          const setItemRegex = /localStorage\.setItem\s*\([^,]+,\s*([^)]+)\)/g;
          let match;
          
          while ((match = setItemRegex.exec(content)) !== null) {
            const value = match[1];
            if (value.includes('password') || value.includes('token') || value.includes('apiKey')) {
              results.push({
                severity: 'error',
                category: 'react-security',
                message: 'Storing sensitive data in localStorage',
                file: filePath,
                suggestion: 'Use secure storage methods for sensitive data',
                confidence: 0.9,
                framework: 'react',
                rule: 'react-security'
              });
            }
          }
        }

        return results;
      }
    });

    // React Testing
    this.rules.push({
      id: 'react-testing',
      name: 'React Testing Best Practices',
      description: 'Validates testing patterns',
      severity: 'info',
      category: 'react-testing',
      frameworks: ['react'],
      filePatterns: [/\.(test|spec)\.(tsx|jsx|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for missing cleanup
        if (content.includes('render(') && !content.includes('cleanup')) {
          results.push({
            severity: 'warning',
            category: 'react-testing',
            message: 'Missing cleanup in tests',
            file: filePath,
            suggestion: 'Use cleanup() or configure automatic cleanup',
            confidence: 0.6,
            framework: 'react',
            rule: 'react-testing'
          });
        }

        // Check for findBy queries without await
        const findByRegex = /findBy\w+\([^)]*\)(?!\s*\))/g;
        let match;
        
        while ((match = findByRegex.exec(content)) !== null) {
          const line = content.substring(0, match.index).split('\n').pop() || '';
          if (!line.includes('await')) {
            results.push({
              severity: 'error',
              category: 'react-testing',
              message: 'findBy query without await',
              file: filePath,
              suggestion: 'findBy queries return promises and must be awaited',
              confidence: 0.95,
              framework: 'react',
              rule: 'react-testing'
            });
          }
        }

        // Check for getBy in async scenarios
        if (content.includes('waitFor') && content.includes('getBy')) {
          results.push({
            severity: 'warning',
            category: 'react-testing',
            message: 'Using getBy with async operations',
            file: filePath,
            suggestion: 'Use findBy or queryBy for async scenarios',
            confidence: 0.7,
            framework: 'react',
            rule: 'react-testing'
          });
        }

        return results;
      }
    });
  }

  /**
   * Returns all React validation rules for integration with the static analyzer.
   * These rules can be added to a StaticAnalyzer instance to enable React-specific
   * validation capabilities.
   * 
   * @returns Array of validation rules for React applications
   * 
   * @example
   * ```typescript
   * const reactAnalyzer = new ReactAnalyzer();
   * const staticAnalyzer = new StaticAnalyzer();
   * reactAnalyzer.getRules().forEach(rule => staticAnalyzer.addRule(rule));
   * ```
   */
  public getRules(): ValidationRule[] {
    return this.rules;
  }
}

export default ReactAnalyzer;
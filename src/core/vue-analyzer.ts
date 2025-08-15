import { ValidationRule, AnalysisContext, AnalysisResult } from './static-analyzer.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('vue-analyzer', 'fluorite-mcp');

export class VueAnalyzer {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Vue 3 Composition API validation
    this.rules.push({
      id: 'vue-composition-api',
      name: 'Vue Composition API Best Practices',
      description: 'Validates proper Composition API usage',
      severity: 'error',
      category: 'vue-composition',
      frameworks: ['vue'],
      filePatterns: [/\.(vue|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for setup function without return
        if (content.includes('setup()') || content.includes('setup(props') ) {
          const setupRegex = /setup\s*\([^)]*\)\s*{([^}]*)}/s;
          const match = content.match(setupRegex);
          
          if (match && !match[1].includes('return')) {
            results.push({
              severity: 'error',
              category: 'vue-composition',
              message: 'Setup function missing return statement',
              file: filePath,
              suggestion: 'Return an object with reactive data and methods from setup()',
              confidence: 0.95,
              framework: 'vue',
              rule: 'vue-composition-api'
            });
          }
        }

        // Check for reactive data mutations
        if (content.includes('reactive(')) {
          const reactiveRegex = /const\s+(\w+)\s*=\s*reactive\(/g;
          let match;
          
          while ((match = reactiveRegex.exec(content)) !== null) {
            const varName = match[1];
            // Check for direct reassignment
            const reassignRegex = new RegExp(`${varName}\\s*=\\s*`, 'g');
            if (reassignRegex.test(content.substring(match.index))) {
              const lineNum = content.substring(0, match.index).split('\n').length;
              results.push({
                severity: 'error',
                category: 'vue-composition',
                message: `Cannot reassign reactive object '${varName}'`,
                file: filePath,
                line: lineNum,
                suggestion: 'Mutate properties of reactive object instead of reassigning',
                confidence: 1.0,
                framework: 'vue',
                rule: 'vue-composition-api'
              });
            }
          }
        }

        // Check for ref without .value access
        if (content.includes('ref(')) {
          const refRegex = /const\s+(\w+)\s*=\s*ref\(/g;
          let match;
          
          while ((match = refRegex.exec(content)) !== null) {
            const varName = match[1];
            // Check if ref is used without .value in script section
            const usageRegex = new RegExp(`(?<!\\.)${varName}(?!\\.value)\\s*[+\\-*/=<>]`, 'g');
            if (usageRegex.test(content.substring(match.index))) {
              results.push({
                severity: 'warning',
                category: 'vue-composition',
                message: `Ref '${varName}' might be used without .value accessor`,
                file: filePath,
                suggestion: `Access ref values with ${varName}.value in script section`,
                confidence: 0.7,
                framework: 'vue',
                rule: 'vue-composition-api'
              });
            }
          }
        }

        return results;
      }
    });

    // Vue Template validation
    this.rules.push({
      id: 'vue-template',
      name: 'Vue Template Validation',
      description: 'Validates Vue template syntax and best practices',
      severity: 'error',
      category: 'vue-template',
      frameworks: ['vue'],
      filePatterns: [/\.vue$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Extract template section
        const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
        if (templateMatch) {
          const template = templateMatch[1];
          
          // Check for v-if and v-for on same element
          const vIfAndForRegex = /<[^>]+v-if[^>]+v-for[^>]*>|<[^>]+v-for[^>]+v-if[^>]*>/g;
          if (vIfAndForRegex.test(template)) {
            results.push({
              severity: 'error',
              category: 'vue-template',
              message: 'Avoid using v-if and v-for on the same element',
              file: filePath,
              suggestion: 'Use computed property to filter list or use template wrapper',
              confidence: 1.0,
              framework: 'vue',
              rule: 'vue-template'
            });
          }

          // Check for missing :key in v-for
          const vForRegex = /<[^>]+v-for[^>]*>/g;
          let match;
          while ((match = vForRegex.exec(template)) !== null) {
            if (!match[0].includes(':key') && !match[0].includes('v-bind:key')) {
              const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;
              results.push({
                severity: 'error',
                category: 'vue-template',
                message: 'v-for directive missing :key attribute',
                file: filePath,
                line: lineNum,
                suggestion: 'Add unique :key attribute to v-for elements',
                confidence: 1.0,
                framework: 'vue',
                rule: 'vue-template'
              });
            }
          }

          // Check for inline styles
          if (template.includes('style=')) {
            results.push({
              severity: 'warning',
              category: 'vue-template',
              message: 'Inline styles detected in template',
              file: filePath,
              suggestion: 'Use CSS classes or computed styles instead of inline styles',
              confidence: 0.8,
              framework: 'vue',
              rule: 'vue-template'
            });
          }

          // Check for complex expressions in template
          const complexExpressionRegex = /\{\{[^}]{50,}\}\}/g;
          if (complexExpressionRegex.test(template)) {
            results.push({
              severity: 'warning',
              category: 'vue-template',
              message: 'Complex expression detected in template',
              file: filePath,
              suggestion: 'Move complex logic to computed properties or methods',
              confidence: 0.7,
              framework: 'vue',
              rule: 'vue-template'
            });
          }
        }

        return results;
      }
    });

    // Vue Props validation
    this.rules.push({
      id: 'vue-props',
      name: 'Vue Props Validation',
      description: 'Validates prop definitions and usage',
      severity: 'warning',
      category: 'vue-props',
      frameworks: ['vue'],
      filePatterns: [/\.(vue|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for props without type definition
        const propsRegex = /props:\s*\[([^\]]+)\]/;
        const arrayPropsMatch = content.match(propsRegex);
        
        if (arrayPropsMatch) {
          results.push({
            severity: 'warning',
            category: 'vue-props',
            message: 'Props defined as array without type validation',
            file: filePath,
            suggestion: 'Use object syntax with type definitions for props',
            confidence: 0.9,
            framework: 'vue',
            rule: 'vue-props'
          });
        }

        // Check for prop mutations
        const definePropsRegex = /defineProps\s*(?:<[^>]+>)?\s*\(\s*\{([^}]+)\}/s;
        const definePropsMatch = content.match(definePropsRegex);
        
        if (definePropsMatch) {
          const propsContent = definePropsMatch[1];
          const propNames = propsContent.match(/(\w+)\s*:/g)?.map(p => p.replace(':', '').trim()) || [];
          
          for (const propName of propNames) {
            const mutationRegex = new RegExp(`props\\.${propName}\\s*=|${propName}\\s*=`, 'g');
            if (mutationRegex.test(content)) {
              results.push({
                severity: 'error',
                category: 'vue-props',
                message: `Mutating prop '${propName}' directly`,
                file: filePath,
                suggestion: 'Props are readonly. Use local data or emit events to parent',
                confidence: 0.95,
                framework: 'vue',
                rule: 'vue-props'
              });
            }
          }
        }

        return results;
      }
    });

    // Vue Reactivity validation
    this.rules.push({
      id: 'vue-reactivity',
      name: 'Vue Reactivity System Validation',
      description: 'Validates proper reactivity usage',
      severity: 'error',
      category: 'vue-reactivity',
      frameworks: ['vue'],
      filePatterns: [/\.(vue|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for array index assignment
        if (content.includes('[') && content.includes(']')) {
          const arrayIndexRegex = /(\w+)\[(\w+)\]\s*=/g;
          let match;
          
          while ((match = arrayIndexRegex.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            results.push({
              severity: 'warning',
              category: 'vue-reactivity',
              message: 'Direct array index assignment may not trigger reactivity',
              file: filePath,
              line: lineNum,
              suggestion: 'Use array methods like splice() or Vue.set() for reactivity',
              confidence: 0.7,
              framework: 'vue',
              rule: 'vue-reactivity'
            });
          }
        }

        // Check for adding new properties to reactive objects
        const addPropertyRegex = /(\w+)\.(\w+)\s*=(?!\s*ref\(|reactive\(|computed\()/g;
        let match;
        
        while ((match = addPropertyRegex.exec(content)) !== null) {
          if (content.includes(`reactive`) || content.includes('ref')) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            results.push({
              severity: 'info',
              category: 'vue-reactivity',
              message: 'Adding new property to reactive object',
              file: filePath,
              line: lineNum,
              suggestion: 'Ensure property is defined in initial reactive state',
              confidence: 0.5,
              framework: 'vue',
              rule: 'vue-reactivity'
            });
          }
        }

        return results;
      }
    });

    // Vue Lifecycle hooks validation
    this.rules.push({
      id: 'vue-lifecycle',
      name: 'Vue Lifecycle Hooks Validation',
      description: 'Validates proper lifecycle hook usage',
      severity: 'warning',
      category: 'vue-lifecycle',
      frameworks: ['vue'],
      filePatterns: [/\.(vue|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for Options API lifecycle in Composition API
        const compositionHooks = ['onMounted', 'onUpdated', 'onUnmounted', 'onBeforeMount'];
        const optionsHooks = ['mounted', 'updated', 'destroyed', 'beforeMount'];
        
        const hasSetup = content.includes('setup()') || content.includes('setup(props');
        const hasCompositionHooks = compositionHooks.some(hook => content.includes(hook));
        const hasOptionsHooks = optionsHooks.some(hook => content.match(new RegExp(`${hook}\\s*\\(`)));
        
        if (hasSetup && hasOptionsHooks && !hasCompositionHooks) {
          results.push({
            severity: 'error',
            category: 'vue-lifecycle',
            message: 'Mixing Options API lifecycle with Composition API',
            file: filePath,
            suggestion: 'Use Composition API lifecycle hooks (onMounted, onUpdated, etc.)',
            confidence: 0.9,
            framework: 'vue',
            rule: 'vue-lifecycle'
          });
        }

        // Check for async lifecycle hooks
        const asyncLifecycleRegex = /async\s+(mounted|created|updated|beforeMount|beforeCreate)\s*\(/g;
        if (asyncLifecycleRegex.test(content)) {
          results.push({
            severity: 'warning',
            category: 'vue-lifecycle',
            message: 'Async lifecycle hooks detected',
            file: filePath,
            suggestion: 'Lifecycle hooks should not be async. Use async functions inside the hook',
            confidence: 0.95,
            framework: 'vue',
            rule: 'vue-lifecycle'
          });
        }

        // Check for DOM manipulation in created hook
        if (content.includes('created') && (content.includes('document.') || content.includes('querySelector'))) {
          results.push({
            severity: 'error',
            category: 'vue-lifecycle',
            message: 'DOM manipulation in created hook',
            file: filePath,
            suggestion: 'DOM is not available in created hook. Use mounted instead',
            confidence: 0.9,
            framework: 'vue',
            rule: 'vue-lifecycle'
          });
        }

        return results;
      }
    });

    // Vue Performance optimization
    this.rules.push({
      id: 'vue-performance',
      name: 'Vue Performance Optimization',
      description: 'Detects performance issues in Vue applications',
      severity: 'warning',
      category: 'vue-performance',
      frameworks: ['vue'],
      filePatterns: [/\.(vue|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for unnecessary watchers
        const watcherCount = (content.match(/watch\s*\(/g) || []).length;
        if (watcherCount > 5) {
          results.push({
            severity: 'warning',
            category: 'vue-performance',
            message: `High number of watchers detected (${watcherCount})`,
            file: filePath,
            suggestion: 'Consider using computed properties or consolidating watchers',
            confidence: 0.7,
            framework: 'vue',
            rule: 'vue-performance'
          });
        }

        // Check for deep watchers
        if (content.includes('deep: true')) {
          results.push({
            severity: 'warning',
            category: 'vue-performance',
            message: 'Deep watcher detected',
            file: filePath,
            suggestion: 'Deep watchers are expensive. Consider watching specific properties',
            confidence: 0.8,
            framework: 'vue',
            rule: 'vue-performance'
          });
        }

        // Check for large v-for lists without pagination
        const vForRegex = /<[^>]+v-for="[^"]*in\s+(\w+)"[^>]*>/g;
        let match;
        
        while ((match = vForRegex.exec(content)) !== null) {
          const listName = match[1];
          // Check if list might be large
          if (!content.includes('slice') && !content.includes('pagination') && !content.includes('limit')) {
            results.push({
              severity: 'info',
              category: 'vue-performance',
              message: `Consider pagination for list '${listName}'`,
              file: filePath,
              suggestion: 'Large lists should use pagination or virtual scrolling',
              confidence: 0.5,
              framework: 'vue',
              rule: 'vue-performance'
            });
          }
        }

        return results;
      }
    });

    // Vue Router validation
    this.rules.push({
      id: 'vue-router',
      name: 'Vue Router Best Practices',
      description: 'Validates Vue Router usage',
      severity: 'warning',
      category: 'vue-router',
      frameworks: ['vue'],
      filePatterns: [/\.(vue|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for navigation guards without next()
        const guardRegex = /beforeRouteEnter|beforeRouteUpdate|beforeRouteLeave/g;
        let match;
        
        while ((match = guardRegex.exec(content)) !== null) {
          const guardName = match[0];
          const functionBody = content.substring(match.index, match.index + 500);
          
          if (!functionBody.includes('next()') && !functionBody.includes('next(')) {
            results.push({
              severity: 'error',
              category: 'vue-router',
              message: `Navigation guard '${guardName}' might be missing next() call`,
              file: filePath,
              suggestion: 'Navigation guards must call next() to resolve the navigation',
              confidence: 0.8,
              framework: 'vue',
              rule: 'vue-router'
            });
          }
        }

        // Check for router.push without error handling
        if (content.includes('router.push') || content.includes('$router.push')) {
          const pushRegex = /(?:router|\$router)\.push\([^)]+\)(?!\.catch)/g;
          if (pushRegex.test(content)) {
            results.push({
              severity: 'warning',
              category: 'vue-router',
              message: 'Router navigation without error handling',
              file: filePath,
              suggestion: 'Add .catch() to handle navigation failures',
              confidence: 0.7,
              framework: 'vue',
              rule: 'vue-router'
            });
          }
        }

        return results;
      }
    });

    // Vue Store (Vuex/Pinia) validation
    this.rules.push({
      id: 'vue-store',
      name: 'Vue Store Management Validation',
      description: 'Validates Vuex/Pinia store usage',
      severity: 'warning',
      category: 'vue-store',
      frameworks: ['vue'],
      filePatterns: [/\.(vue|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for direct state mutation in Vuex
        if (content.includes('$store.state')) {
          const mutationRegex = /\$store\.state\.\w+\s*=/g;
          if (mutationRegex.test(content)) {
            results.push({
              severity: 'error',
              category: 'vue-store',
              message: 'Direct Vuex state mutation detected',
              file: filePath,
              suggestion: 'Use mutations to modify Vuex state',
              confidence: 1.0,
              framework: 'vue',
              rule: 'vue-store'
            });
          }
        }

        // Check for async mutations
        if (content.includes('mutations:')) {
          const mutationsSection = content.match(/mutations:\s*{([^}]*)}/s);
          if (mutationsSection && mutationsSection[1].includes('async')) {
            results.push({
              severity: 'error',
              category: 'vue-store',
              message: 'Async operations in Vuex mutations',
              file: filePath,
              suggestion: 'Mutations must be synchronous. Use actions for async operations',
              confidence: 1.0,
              framework: 'vue',
              rule: 'vue-store'
            });
          }
        }

        // Check for missing error handling in actions
        if (content.includes('actions:')) {
          const actionsSection = content.match(/actions:\s*{([^}]*)}/s);
          if (actionsSection && actionsSection[1].includes('await') && !actionsSection[1].includes('try')) {
            results.push({
              severity: 'warning',
              category: 'vue-store',
              message: 'Store actions without error handling',
              file: filePath,
              suggestion: 'Add try-catch blocks in async actions',
              confidence: 0.7,
              framework: 'vue',
              rule: 'vue-store'
            });
          }
        }

        return results;
      }
    });

    // Vue Security validation
    this.rules.push({
      id: 'vue-security',
      name: 'Vue Security Best Practices',
      description: 'Validates security practices in Vue applications',
      severity: 'error',
      category: 'vue-security',
      frameworks: ['vue'],
      filePatterns: [/\.(vue|ts|js)$/],
      validate: async (context, content, filePath) => {
        const results: AnalysisResult[] = [];
        
        // Check for v-html usage
        if (content.includes('v-html')) {
          results.push({
            severity: 'warning',
            category: 'vue-security',
            message: 'v-html directive can lead to XSS vulnerabilities',
            file: filePath,
            suggestion: 'Sanitize HTML content or use text interpolation instead',
            confidence: 0.9,
            framework: 'vue',
            rule: 'vue-security'
          });
        }

        // Check for eval usage
        if (content.includes('eval(')) {
          results.push({
            severity: 'error',
            category: 'vue-security',
            message: 'eval() usage detected - security risk',
            file: filePath,
            suggestion: 'Avoid eval(). Use safer alternatives',
            confidence: 1.0,
            framework: 'vue',
            rule: 'vue-security'
          });
        }

        // Check for localStorage without encryption
        if (content.includes('localStorage.setItem')) {
          const setItemRegex = /localStorage\.setItem\s*\(\s*['"][^'"]*['"],\s*([^)]+)\)/g;
          let match;
          
          while ((match = setItemRegex.exec(content)) !== null) {
            const value = match[1];
            if (value.includes('password') || value.includes('token') || value.includes('secret')) {
              results.push({
                severity: 'error',
                category: 'vue-security',
                message: 'Storing sensitive data in localStorage without encryption',
                file: filePath,
                suggestion: 'Encrypt sensitive data before storing or use secure storage',
                confidence: 0.9,
                framework: 'vue',
                rule: 'vue-security'
              });
            }
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

export default VueAnalyzer;
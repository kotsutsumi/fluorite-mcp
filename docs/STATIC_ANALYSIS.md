# Fluorite MCP Static Analysis Documentation

## 🚀 Overview

Fluorite MCP now includes comprehensive static analysis capabilities designed to provide extreme pre-execution validation, especially for frameworks like Next.js where runtime errors can be difficult to predict. This system performs deep code analysis, dependency validation, error prediction, and framework-specific checks before code execution.

## 🎯 Key Features

### 1. **Comprehensive Static Analysis**
- TypeScript/JavaScript validation with 10+ built-in rules
- Framework-specific validation (Next.js, React, Vue, Angular)
- Dependency analysis and version conflict detection
- Security vulnerability scanning
- Performance bottleneck identification
- Code quality assessment

### 2. **Error Prediction System**
- Machine learning-inspired pattern matching
- Runtime error prediction with confidence scores
- Hydration error detection for Next.js
- Memory leak detection
- Race condition identification
- Build-time vs runtime error classification

### 3. **Next.js Specific Validation**
- App Router structure validation
- Server/Client component validation
- Image optimization checks
- API route validation
- Environment variable security
- Middleware validation
- Data fetching pattern analysis

### 4. **Dependency Analysis**
- Missing dependency detection
- Version conflict resolution
- Peer dependency validation
- Security vulnerability scanning
- Circular dependency detection
- Duplicate package detection

### 5. **Real-time Validation**
- File-level validation as you code
- Quick code snippet validation
- Watch mode for continuous validation
- IDE integration support

## 📦 MCP Tools

### `static-analysis`

Performs comprehensive static analysis on your entire project or specific files.

**Input Parameters:**
- `projectPath` (required): Project root directory path
- `targetFiles` (optional): Specific files to analyze
- `framework` (optional): Target framework ('nextjs', 'react', 'vue', 'angular')
- `enabledRules` (optional): Specific rules to enable
- `disabledRules` (optional): Specific rules to disable
- `strictMode` (optional): Enable strict validation mode (default: true)
- `autoFix` (optional): Generate auto-fix suggestions
- `predictErrors` (optional): Enable error prediction
- `analyzeDependencies` (optional): Analyze dependencies
- `maxIssues` (optional): Maximum issues to report (default: 1000)

**Example Usage:**
```javascript
{
  "tool": "static-analysis",
  "arguments": {
    "projectPath": "/path/to/your/project",
    "framework": "nextjs",
    "predictErrors": true,
    "analyzeDependencies": true
  }
}
```

### `quick-validate`

Validates code snippets quickly without file system access.

**Input Parameters:**
- `code` (required): Code to validate
- `language` (optional): Code language ('typescript', 'javascript', 'jsx', 'tsx')
- `framework` (optional): Target framework
- `fileName` (optional): Optional file name for context

**Example Usage:**
```javascript
{
  "tool": "quick-validate",
  "arguments": {
    "code": "const Component = () => { useState() }",
    "language": "tsx",
    "framework": "nextjs"
  }
}
```

### `realtime-validation`

Provides real-time validation for individual files.

**Input Parameters:**
- `file` (required): File path to validate
- `content` (optional): File content (if not reading from disk)
- `framework` (optional): Target framework
- `watchMode` (optional): Enable watch mode for continuous validation

**Example Usage:**
```javascript
{
  "tool": "realtime-validation",
  "arguments": {
    "file": "/path/to/component.tsx",
    "framework": "nextjs",
    "watchMode": true
  }
}
```

### `get-validation-rules`

Returns a list of all available validation rules.

**No input parameters required.**

## 🔍 Validation Rules

### Core JavaScript/TypeScript Rules

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `ts-strict-null-checks` | Ensures strict null checking is enabled | error |
| `unused-imports` | Detects unused import statements | warning |
| `async-await-error-handling` | Ensures proper error handling for async functions | error |
| `console-log-detection` | Detects console.log statements | warning |
| `dependency-version-check` | Validates dependency versions | warning |

### Next.js Specific Rules

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `nextjs-app-router-structure` | Validates App Router structure | error |
| `nextjs-server-components` | Validates Server/Client component usage | error |
| `nextjs-image-optimization` | Ensures proper Image component usage | warning |
| `nextjs-api-routes` | Validates API route handlers | error |
| `nextjs-env-vars` | Validates environment variable usage | error |
| `nextjs-dynamic-imports` | Suggests dynamic imports for performance | info |
| `nextjs-config` | Validates next.config.js settings | warning |
| `nextjs-data-fetching` | Validates data fetching patterns | warning |
| `nextjs-middleware` | Validates middleware implementation | error |

### Error Prediction Patterns

| Pattern ID | Description | Probability Range |
|------------|-------------|------------------|
| `nextjs-hydration` | Hydration mismatch detection | 70-90% |
| `undefined-access` | Undefined variable access | 60-80% |
| `async-component` | Async component errors | 80-95% |
| `memory-leak` | Memory leak patterns | 65-85% |
| `race-condition` | Race condition detection | 55-75% |
| `infinite-loop` | Infinite loop detection | 70-90% |
| `import-error` | Import resolution errors | 60-80% |
| `env-var-error` | Environment variable errors | 50-70% |

## 🎨 Usage Examples

### Example 1: Full Project Analysis
```javascript
// Analyze entire Next.js project
{
  "tool": "static-analysis",
  "arguments": {
    "projectPath": "/Users/dev/my-nextjs-app",
    "framework": "nextjs",
    "predictErrors": true,
    "analyzeDependencies": true,
    "strictMode": true
  }
}
```

### Example 2: Quick Component Validation
```javascript
// Validate a React component
{
  "tool": "quick-validate",
  "arguments": {
    "code": `
      'use client';
      import { useState } from 'react';
      
      export default function Counter() {
        const [count, setCount] = useState(0);
        console.log('Rendering');
        
        return (
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
        );
      }
    `,
    "language": "tsx",
    "framework": "nextjs"
  }
}
```

### Example 3: Real-time File Monitoring
```javascript
// Monitor a file for issues
{
  "tool": "realtime-validation",
  "arguments": {
    "file": "/Users/dev/project/app/page.tsx",
    "framework": "nextjs",
    "watchMode": true
  }
}
```

## 📊 Output Format

### Static Analysis Report
```
📊 Static Analysis Report
==================================================

🔍 Summary:
  • Errors: 5
  • Warnings: 12
  • Info: 3

📋 Issues:

📁 nextjs-components:
  ❌ Using client-side hook 'useState' in a Server Component
     📄 app/components/Header.tsx:15
     💡 Add 'use client' directive at the top of the file
     🎯 Confidence: 100%

📁 dependencies:
  ⚠️ Missing dependency: 'lodash'
     📄 src/utils/helpers.ts:3
     💡 Run: npm install lodash
     🎯 Confidence: 95%

🔮 Error Prediction Report
==================================================

📊 Summary:
  • Total Predictions: 8
  • High Risk (>70%): 3
  • Medium Risk (40-70%): 4
  • Low Risk (<40%): 1

⚠️ Predicted Errors:

🕐 RUNTIME Phase:
  🔴 HydrationError (85% probability)
     📝 Potential hydration mismatch detected
     📄 app/components/Timer.tsx
     💡 Prevention: Use useEffect for client-only code
     🔍 Expected: Error: Text content does not match server-rendered HTML
```

## 🔧 Configuration

### Environment Variables

- `FLUORITE_LOG_LEVEL`: Set logging level (debug, info, warn, error)
- `FLUORITE_CATALOG_DIR`: Override default catalog directory
- `NODE_ENV`: Set to 'development' for verbose logging

### Custom Rules

You can add custom validation rules by extending the `ValidationRule` interface:

```typescript
const customRule: ValidationRule = {
  id: 'custom-rule',
  name: 'Custom Validation Rule',
  description: 'Description of what this rule validates',
  severity: 'error',
  category: 'custom',
  frameworks: ['nextjs'],
  validate: async (context, content, filePath) => {
    const results: AnalysisResult[] = [];
    // Your validation logic here
    return results;
  }
};
```

## 🚀 Performance Considerations

- **File Discovery**: Automatically excludes node_modules, dist, build, .next directories
- **Incremental Analysis**: Can analyze specific files instead of entire project
- **Caching**: Results are cached for improved performance
- **Parallel Processing**: Multiple files analyzed concurrently
- **Smart Rule Selection**: Framework-specific rules only run for relevant frameworks

## 🛡️ Security Features

- **Vulnerability Scanning**: Checks for known security vulnerabilities in dependencies
- **Environment Variable Validation**: Ensures sensitive data isn't exposed to client
- **CORS Configuration**: Validates API route CORS headers
- **Authentication Patterns**: Detects potential authentication issues
- **Input Validation**: Checks for proper input sanitization

## 📈 Benefits

1. **Catch Errors Before Runtime**: Identify issues before deployment
2. **Framework-Specific Intelligence**: Tailored validation for your framework
3. **Predictive Analysis**: AI-inspired error prediction
4. **Comprehensive Coverage**: From syntax to security to performance
5. **Developer Productivity**: Reduce debugging time significantly
6. **CI/CD Integration**: Can be integrated into build pipelines
7. **Real-time Feedback**: Get validation as you code

## 🔄 Integration with Claude Code

This static analysis system is specifically designed to enhance Claude Code's capabilities for code validation. When using Claude Code with this MCP server:

1. Claude Code can request validation before suggesting code changes
2. Real-time validation during code generation
3. Predictive error analysis for generated code
4. Framework-aware code suggestions
5. Dependency compatibility checks

## 📝 Best Practices

1. **Run Early and Often**: Use real-time validation during development
2. **CI/CD Integration**: Add static-analysis to your build pipeline
3. **Framework Selection**: Always specify your framework for best results
4. **Custom Rules**: Add project-specific validation rules
5. **Error Prediction**: Pay attention to high-probability predictions
6. **Dependency Analysis**: Run regularly to catch version conflicts
7. **Strict Mode**: Use for production builds

## 🎯 Next.js Specific Tips

1. **Server Components**: Validate server/client component boundaries
2. **Data Fetching**: Check fetch cache configurations
3. **Image Optimization**: Ensure all images use Next.js Image component
4. **Environment Variables**: Validate NEXT_PUBLIC_ prefix usage
5. **API Routes**: Verify proper response handling
6. **Middleware**: Keep middleware lightweight
7. **App Router**: Follow naming conventions

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [MCP Protocol Documentation](https://modelcontextprotocol.org/)

## 🤝 Contributing

To add new validation rules or improve existing ones:

1. Create a new rule following the `ValidationRule` interface
2. Add framework-specific logic if needed
3. Include error prediction patterns
4. Add comprehensive tests
5. Update documentation

## 📄 License

This static analysis system is part of the Fluorite MCP server and is released under the MIT License.
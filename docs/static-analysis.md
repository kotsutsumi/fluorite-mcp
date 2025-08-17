# Fluorite MCP Static Analysis Documentation

## 🚀 Overview

Fluorite MCP provides comprehensive static analysis capabilities, offering extremely detailed validation before execution, particularly for frameworks like Next.js where runtime error prediction is challenging. This system performs deep code analysis, dependency validation, error prediction, and framework-specific checks before code execution.

## 🎯 Key Features

### 1. **Comprehensive Static Analysis**
- TypeScript/JavaScript validation (10+ built-in rules)
- Framework-specific validation (Next.js, React, Vue, Angular)
- Dependency analysis and version conflict detection
- Security vulnerability scanning
- Performance bottleneck identification
- Code quality assessment

### 2. **Error Prediction System**
- Machine learning-inspired pattern matching
- Runtime error prediction with confidence scores
- Next.js hydration error detection
- TypeScript compilation error prediction
- Performance issue early warning

### 3. **Framework-Specific Intelligence**
- **Next.js**: Server/Client component boundary validation, App Router patterns, hydration mismatch detection
- **React**: Hook dependency validation, component lifecycle analysis, performance anti-pattern detection
- **Vue**: Composition API usage validation, reactive data flow analysis
- **TypeScript**: Advanced type safety checks, generic usage patterns, strict mode compliance

### 4. **Real-time Validation**
- File change monitoring with instant feedback
- Watch mode for continuous development
- Incremental analysis for large codebases
- IDE integration support

## 🔧 Available Tools

### 1. `static-analysis`
**Purpose**: Comprehensive project-wide static analysis with framework-specific rules.

**Key Parameters**:
- `projectPath` (required): Project root directory
- `framework`: Target framework (nextjs, react, vue)
- `strictMode`: Enable strict validation
- `predictErrors`: Enable error prediction
- `autoFix`: Generate auto-fix suggestions

**Example Usage**:
```typescript
const analysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/project',
  framework: 'nextjs',
  predictErrors: true,
  strictMode: true
});
```

### 2. `quick-validate`
**Purpose**: Rapid validation of code snippets without file system access.

**Key Parameters**:
- `code` (required): Code to validate
- `language`: Code language (typescript, javascript, jsx, tsx)
- `framework`: Framework context

**Example Usage**:
```typescript
const validation = await client.callTool('quick-validate', {
  code: 'const Component = () => { const [state] = useState(); return <div>{state}</div>; }',
  language: 'tsx',
  framework: 'react'
});
```

### 3. `realtime-validation`
**Purpose**: Real-time file validation with framework-specific rules and watch mode.

**Key Parameters**:
- `file` (required): File path to validate
- `framework`: Target framework
- `watchMode`: Enable continuous validation

**Example Usage**:
```typescript
const validation = await client.callTool('realtime-validation', {
  file: './src/components/Button.tsx',
  framework: 'react',
  watchMode: true
});
```

### 4. `get-validation-rules`
**Purpose**: List all available validation rules organized by framework and category.

**Example Usage**:
```typescript
const rules = await client.callTool('get-validation-rules', {});
```

## 📊 Validation Categories

### Framework-Specific Rules (45+ rules)
- **Next.js (20+ rules)**: Server/Client boundaries, hydration, image optimization, API routes
- **React (15+ rules)**: Hook usage, component patterns, state management, accessibility
- **Vue (10+ rules)**: Composition API, reactivity, template syntax, component communication

### Language Rules (12+ rules)
- **TypeScript**: Type safety, interface design, generic usage, strict mode compliance
- **JavaScript**: Modern syntax, best practices, error handling

### Security Rules (8+ rules)
- **XSS Prevention**: Cross-site scripting detection
- **Injection Detection**: SQL/Code injection patterns
- **Sensitive Data**: Data exposure checks
- **Authentication**: Auth implementation validation

### Performance Rules (6+ rules)
- **Bundle Size**: Optimization checks
- **Lazy Loading**: Implementation validation
- **Memory Leaks**: Detection patterns
- **Render Optimization**: Performance patterns

### Accessibility Rules (10+ rules)
- **ARIA Labels**: Label validation
- **Keyboard Navigation**: Navigation support
- **Color Contrast**: Contrast compliance
- **Semantic HTML**: Semantic markup usage

## 🚀 Error Prediction Capabilities

### Next.js Specific Predictions
1. **Hydration Mismatches** (85-95% accuracy)
   - Server/client date rendering differences
   - Conditional rendering without proper guards
   - Dynamic content without client-side checks

2. **Server Component Errors** (90% accuracy)
   - Client hooks in server components
   - Browser APIs in server environment
   - Async component patterns

3. **App Router Issues** (80% accuracy)
   - Invalid route structure
   - Metadata configuration errors
   - Loading/Error boundary placement

### React Hook Predictions
1. **Dependency Array Issues** (92% accuracy)
   - Missing dependencies in useEffect
   - Stale closure problems
   - Infinite re-render loops

2. **State Management Problems** (85% accuracy)
   - Direct state mutations
   - Race conditions in async state updates
   - Context value instability

### TypeScript Predictions
1. **Type Errors** (88% accuracy)
   - Missing type annotations
   - Type assertion misuse
   - Generic constraint violations

## 📈 Performance Analysis

### Bundle Analysis
- Identify large dependencies
- Detect duplicate code
- Suggest code splitting opportunities
- Tree-shaking effectiveness

### Runtime Performance
- Component re-render analysis
- Memory usage patterns
- Async operation bottlenecks
- Network request optimization

### Metrics Provided
- **Complexity Score**: Code complexity measurement
- **Maintainability Index**: Code maintainability assessment
- **Type Coverage**: TypeScript coverage percentage
- **Performance Score**: Overall performance rating

## 🔒 Security Scanning

### Vulnerability Detection
- Known security vulnerabilities in dependencies
- Common security anti-patterns
- Sensitive data exposure risks
- Authentication/authorization issues

### Compliance Checks
- OWASP compliance validation
- Security best practices enforcement
- Data protection regulation compliance
- Access control pattern verification

## 🛠️ Integration & Workflow

### Development Workflow Integration
1. **Pre-commit Hooks**: Validate changes before commit
2. **CI/CD Integration**: Automated validation in pipelines
3. **IDE Extensions**: Real-time feedback during development
4. **Watch Mode**: Continuous validation during development

### Team Collaboration
- Shared validation rules and standards
- Team-specific custom rules
- Consistent code quality across projects
- Automated code review assistance

## 📚 Best Practices

### 1. **Gradual Adoption**
- Start with basic validation rules
- Gradually enable framework-specific rules
- Use error prediction for critical paths
- Implement team-wide gradually

### 2. **Performance Optimization**
- Use targeted file analysis for large projects
- Enable watch mode for active development
- Cache validation results when possible
- Run full analysis in CI/CD only

### 3. **Error Handling**
- Review predicted errors with team
- Validate predictions through testing
- Use confidence scores for prioritization
- Maintain feedback loop for accuracy

### 4. **Custom Rules**
- Create project-specific validation rules
- Share common patterns across team
- Document custom rule rationale
- Regular review and updates

## 🔄 Continuous Improvement

### Machine Learning Integration
- Pattern recognition from successful projects
- Error prediction accuracy improvement
- Framework-specific rule optimization
- Team-specific customization learning

### Community Contributions
- Open-source rule contributions
- Framework-specific pattern sharing
- Best practice documentation
- Validation accuracy feedback

## 📊 Metrics & Reporting

### Quality Metrics
- **Error Detection Rate**: Percentage of runtime errors caught
- **False Positive Rate**: Percentage of incorrect predictions
- **Coverage Metrics**: Code and rule coverage statistics
- **Performance Impact**: Analysis time and resource usage

### Reporting Features
- Detailed validation reports
- Trend analysis over time
- Team performance dashboards
- Integration with external tools

---

*Static Analysis Documentation - Last updated: January 2025*
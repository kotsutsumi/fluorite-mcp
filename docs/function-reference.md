# Function Reference - Comprehensive Guide

Complete documentation for all Fluorite MCP functions with detailed examples, parameters, and usage patterns.

## 📖 Table of Contents

- [MCP Tools Overview](#mcp-tools-overview)
- [Specification Management](#specification-management)
- [Static Analysis Tools](#static-analysis-tools)
- [Spike Development Tools](#spike-development-tools)
- [Diagnostic Tools](#diagnostic-tools)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## MCP Tools Overview

Fluorite MCP provides 15 specialized tools organized into 4 main categories:

| Category | Tools | Purpose |
|----------|-------|---------|
| **Specification Management** | 3 tools | Library specs and catalog operations |
| **Static Analysis** | 4 tools | Code analysis and validation |
| **Spike Development** | 6 tools | Rapid prototyping and templates |
| **Diagnostics** | 3 tools | Server health and performance monitoring |

---

## Specification Management

### 1. list-specs

**Purpose**: Lists all available library specifications in the catalog with optional filtering.

**Parameters**:
```typescript
{
  filter?: string  // Optional filter pattern for package names
}
```

**Usage Examples**:

#### Basic Listing
```typescript
// List all specifications
const allSpecs = await client.callTool('list-specs', {});

// Expected response:
{
  content: [{
    type: "text",
    text: "Found 87 specification(s):\n\nshadcn__ui\ntanstack-table\nnextauth\nprisma\n..."
  }]
}
```

#### Filtered Listing
```typescript
// List React-related specifications
const reactSpecs = await client.callTool('list-specs', {
  filter: 'react'
});

// List Next.js specifications
const nextSpecs = await client.callTool('list-specs', {
  filter: 'next'
});

// List authentication libraries
const authSpecs = await client.callTool('list-specs', {
  filter: 'auth'
});
```

**Natural Language Usage**:
```
"Show me all available library specifications"
"List React-related specifications"
"What authentication libraries are available?"
```

**Response Format**:
- **Success**: Text listing all matching specifications
- **Empty**: Message indicating no specifications found
- **Error**: Error message with details

---

### 2. upsert-spec

**Purpose**: Creates or updates a library specification in the catalog.

**Parameters**:
```typescript
{
  pkg: string      // Package identifier (max 255 chars)
  yaml: string     // YAML specification content (max 1MB)
}
```

**Usage Examples**:

#### Creating a New Specification
```typescript
const customSpec = `
name: My Custom Library
version: 1.0.0
description: A custom library for specialized functionality
category: custom-tools
homepage: # ライブラリのホームページURL
repository: # GitリポジトリURL
language: TypeScript

features:
  - Custom data processing
  - Type-safe API
  - High performance algorithms

configuration: |
  import { MyLibrary } from 'my-custom-library';
  
  const lib = new MyLibrary({
    apiKey: process.env.API_KEY,
    enableCache: true
  });

best_practices:
  - Always validate input data
  - Use TypeScript for better type safety
  - Enable caching for better performance
`;

const result = await client.callTool('upsert-spec', {
  pkg: 'my-custom-library',
  yaml: customSpec
});
```

#### Updating an Existing Specification
```typescript
// Update with additional examples
const updatedSpec = `
name: My Custom Library
version: 1.1.0
description: Updated custom library with new features
category: custom-tools

features:
  - Custom data processing
  - Type-safe API
  - High performance algorithms
  - New: Async operations support

examples:
  basic_usage: |
    const result = await lib.processData(inputData);
    console.log(result);
  
  advanced_usage: |
    const stream = lib.createDataStream();
    stream.on('data', (chunk) => console.log(chunk));
`;

await client.callTool('upsert-spec', {
  pkg: 'my-custom-library',
  yaml: updatedSpec
});
```

**Validation Rules**:
- Package name: 1-255 characters, alphanumeric with dashes/underscores
- YAML content: Valid YAML syntax, max 1MB size
- Required fields: `name`, `description`, `category`

**Natural Language Usage**:
```
"Add a specification for my custom authentication library"
"Update the React hook form specification with new examples"
"Create a spec for our internal UI component library"
```

---

### 3. catalog-stats

**Purpose**: Displays comprehensive statistics about the specification catalog.

**Parameters**: None

**Usage Examples**:

#### Basic Statistics
```typescript
const stats = await client.callTool('catalog-stats', {});

// Example response:
{
  content: [{
    type: "text",
    text: `Catalog Statistics:
• Total specifications: 87
• Location: /path/to/catalog
• By extension:
  - .yaml: 85
  - .json: 2
• Last updated: 2025-08-15T10:30:00.000Z`
  }]
}
```

**Information Provided**:
- **Total Count**: Number of specifications in catalog
- **Storage Location**: File system path to catalog directory
- **File Types**: Breakdown by file extension (.yaml, .json)
- **Last Updated**: Timestamp of most recent modification
- **Size Information**: Total catalog size and average spec size

**Natural Language Usage**:
```
"Show me catalog statistics"
"How many specifications are available?"
"What's the current state of the library catalog?"
```

---

## Static Analysis Tools

### 4. static-analysis

**Purpose**: Performs comprehensive static analysis on code projects with framework-specific rules and error prediction.

**Parameters**:
```typescript
{
  projectPath: string              // Project root directory path (required)
  targetFiles?: string[]           // Specific files to analyze
  framework?: "nextjs"|"react"|"vue"  // Target framework
  strictMode?: boolean             // Enable strict validation mode
  maxIssues?: number              // Maximum issues to report
  enabledRules?: string[]         // Specific rules to enable
  disabledRules?: string[]        // Specific rules to disable
  autoFix?: boolean               // Generate auto-fix suggestions
  analyzeDependencies?: boolean   // Analyze dependencies
  predictErrors?: boolean         // Enable error prediction
}
```

**Usage Examples**:

#### Basic Project Analysis
```typescript
const analysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/my-project',
  framework: 'nextjs',
  predictErrors: true
});

// Example response:
{
  content: [{
    type: "text",
    text: `Static Analysis Results:

🔍 Analysis Summary:
• Files analyzed: 45
• Errors: 3
• Warnings: 12
• Info: 5

❌ Critical Issues:
1. app/page.tsx:15 - Client hook useState used in Server Component
   Fix: Add 'use client' directive at top of file

2. components/UserProfile.tsx:23 - Potential hydration mismatch
   Fix: Use useEffect for client-side only operations

⚠️ Warnings:
1. utils/helpers.ts:8 - Unused import 'debounce'
2. components/Button.tsx:45 - Missing accessibility attributes

🔮 Error Predictions:
1. HydrationError (85% probability) - Date.now() in SSR component
2. TypeScript error (72% probability) - Missing type annotation
`
  }]
}
```

#### Framework-Specific Analysis
```typescript
// Next.js specific analysis
const nextAnalysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/nextjs-app',
  framework: 'nextjs',
  enabledRules: [
    'nextjs-client-server-boundary',
    'nextjs-hydration-check',
    'nextjs-image-optimization'
  ],
  strictMode: true
});

// React specific analysis
const reactAnalysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/react-app',
  framework: 'react',
  enabledRules: [
    'react-hooks-deps',
    'react-hooks-order',
    'react-accessibility'
  ],
  autoFix: true
});

// Vue specific analysis
const vueAnalysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/vue-app',
  framework: 'vue',
  enabledRules: [
    'vue-composition-api',
    'vue-template-syntax',
    'vue-reactivity'
  ]
});
```

#### Targeted File Analysis
```typescript
const fileAnalysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/project',
  targetFiles: [
    'src/components/Button.tsx',
    'src/utils/api.ts',
    'pages/dashboard.tsx'
  ],
  framework: 'nextjs',
  maxIssues: 20
});
```

**Analysis Categories**:

| Framework | Rules | Focus Areas |
|-----------|-------|-------------|
| **Next.js** | 20+ rules | Server/Client boundaries, Hydration, Image optimization, Route configuration |
| **React** | 15+ rules | Hook usage, Component patterns, State management, Accessibility |
| **Vue** | 10+ rules | Composition API, Reactivity, Template syntax, Component communication |
| **TypeScript** | 12+ rules | Type safety, Interface design, Generic usage, Strict mode compliance |

**Natural Language Usage**:
```
"Analyze my Next.js project for potential issues"
"Check this React component for best practices violations"
"Run static analysis with error prediction enabled"
"Analyze these specific files for TypeScript issues"
```

---

### 5. quick-validate

**Purpose**: Rapidly validates code snippets without file system access.

**Parameters**:
```typescript
{
  code: string                     // Code to validate (required)
  language?: "typescript"|"javascript"|"jsx"|"tsx"  // Code language
  framework?: string               // Framework context
  fileName?: string                // Optional file name for context
}
```

**Usage Examples**:

#### TypeScript Validation
```typescript
const tsCode = `
const Component = () => {
  const [state, setState] = useState();
  return <div>{state}</div>;
};
`;

const validation = await client.callTool('quick-validate', {
  code: tsCode,
  language: 'tsx',
  framework: 'react'
});

// Example response:
{
  content: [{
    type: "text",
    text: `Validation Results:

❌ Issues Found:
1. Line 2: Missing import for 'useState' from React
2. Line 2: useState hook needs type annotation
3. Line 3: Missing type for 'state' variable

✅ Suggestions:
1. Add: import { useState } from 'react';
2. Change to: const [state, setState] = useState<string>('');
3. Add proper TypeScript types for better type safety
`
  }]
}
```

#### JavaScript Hook Validation
```typescript
const jsCode = `
function useCustomHook(dependency) {
  useEffect(() => {
    console.log('Effect running');
  }, []);
  return dependency * 2;
}
`;

const validation = await client.callTool('quick-validate', {
  code: jsCode,
  language: 'javascript',
  framework: 'react',
  fileName: 'useCustomHook.js'
});
```

#### Next.js Component Validation
```typescript
const nextComponent = `
export default function Page() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <div>{new Date().toLocaleString()}</div>;
}
`;

const validation = await client.callTool('quick-validate', {
  code: nextComponent,
  language: 'tsx',
  framework: 'nextjs',
  fileName: 'app/page.tsx'
});
```

**Validation Checks**:
- **Syntax Errors**: Invalid JavaScript/TypeScript syntax
- **Import Issues**: Missing or incorrect imports
- **Hook Rules**: React hooks usage patterns
- **Type Safety**: TypeScript type annotations and inference
- **Framework Patterns**: Framework-specific best practices
- **Performance**: Anti-patterns that affect performance

**Natural Language Usage**:
```
"Validate this React component code"
"Check this TypeScript function for issues"
"Analyze this Next.js page component"
"Validate this custom hook implementation"
```

---

### 6. realtime-validation

**Purpose**: Performs real-time validation on files with framework-specific rules and optional watch mode.

**Parameters**:
```typescript
{
  file: string                     // File path to validate (required)
  content?: string                 // File content (if not reading from disk)
  framework?: string               // Target framework
  watchMode?: boolean              // Enable continuous validation
}
```

**Usage Examples**:

#### Single File Validation
```typescript
const validation = await client.callTool('realtime-validation', {
  file: './src/components/Button.tsx',
  framework: 'react'
});

// Example response:
{
  content: [{
    type: "text",
    text: `Real-time Validation Results for Button.tsx:

✅ File Status: Valid
📊 Metrics:
• Lines of code: 45
• Complexity score: 3 (Low)
• Maintainability index: 85 (Good)
• Type coverage: 95%

⚠️ Suggestions:
1. Consider adding prop validation with PropTypes or TypeScript interfaces
2. Extract inline styles to styled-components for better maintainability
`
  }]
}
```

#### Content-Based Validation
```typescript
const fileContent = `
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
`;

const validation = await client.callTool('realtime-validation', {
  file: 'components/UserProfile.tsx',
  content: fileContent,
  framework: 'react'
});
```

#### Watch Mode Validation
```typescript
// Enable continuous validation for active development
const watchValidation = await client.callTool('realtime-validation', {
  file: './src/pages/dashboard.tsx',
  framework: 'nextjs',
  watchMode: true
});
```

**Validation Features**:
- **Real-time Feedback**: Immediate validation results
- **Framework Awareness**: Context-specific rules and suggestions
- **Metrics Calculation**: Code complexity, maintainability, and quality scores
- **Performance Analysis**: Bundle impact and optimization opportunities
- **Accessibility Checks**: WCAG compliance and best practices
- **Security Scanning**: Common vulnerability patterns

**Natural Language Usage**:
```
"Validate this component file in real-time"
"Check the current state of my dashboard page"
"Enable watch mode for continuous validation"
"Analyze this file's maintainability metrics"
```

---

### 7. get-validation-rules

**Purpose**: Returns all available validation rules organized by framework and category.

**Parameters**: None

**Usage Examples**:

#### Complete Rules Listing
```typescript
const rules = await client.callTool('get-validation-rules', {});

// Example response:
{
  content: [{
    type: "text",
    text: `Available Validation Rules:

🏗️ Framework-Specific Rules:

📱 React (15 rules):
• react-hooks-deps - Validates useEffect dependencies
• react-hooks-order - Ensures hooks are called in consistent order
• react-prop-types - Validates component prop types
• react-accessibility - Checks ARIA and semantic HTML
• react-performance - Identifies performance anti-patterns

⚡ Next.js (20 rules):
• nextjs-client-server-boundary - Server/Client component validation
• nextjs-hydration-check - Prevents hydration mismatches
• nextjs-image-optimization - Validates Next.js Image component usage
• nextjs-api-routes - API route pattern validation
• nextjs-middleware - Middleware implementation checks

🖖 Vue.js (10 rules):
• vue-composition-api - Composition API best practices
• vue-template-syntax - Template syntax validation
• vue-reactivity - Reactive data pattern checks
• vue-component-props - Prop validation and typing
• vue-lifecycle - Lifecycle hook usage patterns

📘 TypeScript (12 rules):
• typescript-strict-mode - Strict mode compliance
• typescript-type-safety - Type annotation requirements
• typescript-generic-usage - Generic type patterns
• typescript-interface-design - Interface best practices

🛡️ Security (8 rules):
• security-xss-prevention - Cross-site scripting prevention
• security-injection - SQL/Code injection detection
• security-sensitive-data - Sensitive data exposure checks
• security-auth-patterns - Authentication implementation validation

⚡ Performance (6 rules):
• performance-bundle-size - Bundle optimization checks
• performance-lazy-loading - Lazy loading implementation
• performance-memory-leaks - Memory leak detection
• performance-render-optimization - Rendering performance patterns

♿ Accessibility (10 rules):
• accessibility-aria-labels - ARIA label validation
• accessibility-keyboard-nav - Keyboard navigation support
• accessibility-color-contrast - Color contrast compliance
• accessibility-semantic-html - Semantic HTML usage

Total Rules: 50+
Severity Levels: error, warning, info
Auto-fix Available: 35+ rules
`
  }]
}
```

**Rule Categories**:

| Category | Rule Count | Coverage |
|----------|------------|----------|
| **Framework-Specific** | 45+ rules | React, Next.js, Vue.js patterns |
| **Language** | 12+ rules | TypeScript, JavaScript best practices |
| **Security** | 8+ rules | Common vulnerabilities and secure coding |
| **Performance** | 6+ rules | Optimization and efficiency patterns |
| **Accessibility** | 10+ rules | WCAG compliance and inclusive design |

**Natural Language Usage**:
```
"Show me all available validation rules"
"What React-specific rules are available?"
"List the security validation rules"
"What accessibility checks are supported?"
```

---

## Spike Development Tools

### 8. discover-spikes

**Purpose**: Discovers and lists spike templates based on natural language queries or browsing.

**Parameters**:
```typescript
{
  query?: string                   // Optional natural language query
  limit?: number                   // Limit number of results
}
```

**Usage Examples**:

#### Natural Language Discovery
```typescript
const authSpikes = await client.callTool('discover-spikes', {
  query: 'authentication with JWT',
  limit: 5
});

// Example response:
{
  content: [{
    type: "text",
    text: `🔍 Spike Discovery Results for "authentication with JWT":

Found 5 relevant templates:

1. 🔐 fastapi-jwt-auth
   • Purpose: JWT authentication for FastAPI
   • Stack: Python, FastAPI, PyJWT, Pydantic
   • Features: Token generation, validation, refresh tokens
   • Difficulty: Intermediate

2. 🔐 nextjs-auth-nextauth-credentials
   • Purpose: Next.js authentication with credentials
   • Stack: Next.js, NextAuth.js, JWT
   • Features: Custom login, session management
   • Difficulty: Beginner

3. 🔐 nextauth-jwt-provider
   • Purpose: NextAuth.js with JWT provider
   • Stack: Next.js, NextAuth.js, JWT tokens
   • Features: Custom JWT handling, session callbacks
   • Difficulty: Intermediate

4. 🔐 express-jwt-auth
   • Purpose: Express.js JWT authentication
   • Stack: Node.js, Express, jsonwebtoken
   • Features: Middleware, token validation, CORS
   • Difficulty: Beginner

5. 🔐 fastapi-oauth2-scopes
   • Purpose: OAuth2 with scopes for FastAPI
   • Stack: Python, FastAPI, OAuth2, JWT
   • Features: Scope-based authorization, role management
   • Difficulty: Advanced

💡 Quick Actions:
• Preview: Use preview-spike with template ID
• Apply: Use apply-spike to generate code
• Explain: Use explain-spike for detailed documentation
`
  }]
}
```

#### Category-Based Discovery
```typescript
const frontendSpikes = await client.callTool('discover-spikes', {
  query: 'react component testing',
  limit: 10
});

const apiSpikes = await client.callTool('discover-spikes', {
  query: 'fastapi database integration'
});

const cicdSpikes = await client.callTool('discover-spikes', {
  query: 'github actions deployment'
});
```

#### Browse All Templates
```typescript
const allSpikes = await client.callTool('discover-spikes', {
  limit: 50
});
```

**Template Categories**:

| Category | Count | Examples |
|----------|-------|----------|
| **Web Frameworks** | 98+ | Next.js apps, React components, Vue applications |
| **Backend APIs** | 59+ | FastAPI endpoints, Express servers, authentication |
| **Testing & Quality** | 58+ | Playwright tests, Vitest setups, accessibility testing |
| **Infrastructure** | 40+ | Docker containers, CI/CD pipelines, deployment |
| **UI Components** | 27+ | Component libraries, design systems |

**Natural Language Usage**:
```
"Find templates for React drag and drop"
"Show me FastAPI database integration spikes"
"What testing templates are available?"
"Find Next.js authentication examples"
```

---

### 9. auto-spike

**Purpose**: Automatically selects the best spike template based on natural language requirements and suggests next actions.

**Parameters**:
```typescript
{
  task: string                     // Natural language task description (required)
  constraints?: Record<string, string>  // Resolved parameters
}
```

**Usage Examples**:

#### Automatic Template Selection
```typescript
const autoSelection = await client.callTool('auto-spike', {
  task: 'Create a Next.js app with authentication and database'
});

// Example response:
{
  content: [{
    type: "text",
    text: `🤖 Auto-Spike Analysis for: "Create a Next.js app with authentication and database"

🎯 Best Match Selected: nextjs-auth-prisma-complete

📊 Selection Reasoning:
• Task requires: Next.js + Authentication + Database
• Match confidence: 95%
• Template complexity: Intermediate
• Estimated setup time: 15-20 minutes

🏗️ Template Details:
• Framework: Next.js 14 with App Router
• Authentication: NextAuth.js with multiple providers
• Database: Prisma with PostgreSQL
• UI: Tailwind CSS with shadcn/ui components
• Additional: TypeScript, ESLint, Prettier

📋 Suggested Next Steps:
1. Preview template: preview-spike with ID "nextjs-auth-prisma-complete"
2. Customize parameters:
   - app_name: your-app-name
   - database_provider: postgresql (or mysql, sqlite)
   - auth_providers: google,github (or other combinations)
3. Apply template: apply-spike to generate project structure
4. Follow setup instructions for environment configuration

🔗 Related Templates:
• nextjs-minimal - Simpler Next.js starting point
• nextjs-auth-nextauth-credentials - Authentication only
• nextjs-prisma-sqlite-crud - Database operations focus

💡 Pro Tip: Use constraints parameter to specify exact requirements like framework versions or specific libraries.
`
  }]
}
```

#### Constrained Selection
```typescript
const constrainedSelection = await client.callTool('auto-spike', {
  task: 'Build a REST API with authentication',
  constraints: {
    language: 'python',
    framework: 'fastapi',
    database: 'postgresql',
    auth_method: 'jwt'
  }
});
```

#### Complex Requirements
```typescript
const complexSelection = await client.callTool('auto-spike', {
  task: 'Create a full-stack application with real-time features, user authentication, file uploads, and payment processing'
});
```

**Selection Algorithm**:
1. **Requirement Analysis**: Parses natural language for technical requirements
2. **Template Matching**: Scores templates based on feature alignment
3. **Complexity Assessment**: Evaluates implementation difficulty
4. **Best Fit Selection**: Chooses optimal template with confidence score
5. **Next Action Planning**: Provides specific steps for implementation

**Natural Language Usage**:
```
"I need to build a chat application with real-time messaging"
"Create a dashboard with data visualization and user management"
"Build an e-commerce site with payment integration"
"Set up testing for a React component library"
```

---

### 10. preview-spike

**Purpose**: Provides detailed preview of spike template contents before application.

**Parameters**:
```typescript
{
  id: string                       // Spike template ID (required)
  params?: Record<string, string>  // Template parameters
}
```

**Usage Examples**:

#### Basic Template Preview
```typescript
const preview = await client.callTool('preview-spike', {
  id: 'nextjs-minimal'
});

// Example response:
{
  content: [{
    type: "text",
    text: `📋 Spike Template Preview: nextjs-minimal

📝 Template Information:
• Name: Next.js Minimal Application
• Version: 1.2.0
• Stack: Next.js 14, React 18, TypeScript, Tailwind CSS
• Difficulty: Beginner
• Setup Time: ~5 minutes

📁 Generated File Structure:
my-nextjs-app/
├── 📄 package.json - Dependencies and scripts
├── 📄 next.config.js - Next.js configuration
├── 📄 tailwind.config.js - Tailwind CSS configuration
├── 📄 tsconfig.json - TypeScript configuration
├── 📁 app/
│   ├── 📄 layout.tsx - Root layout component
│   ├── 📄 page.tsx - Home page component
│   └── 📄 globals.css - Global styles
├── 📁 components/
│   └── 📄 ui/ - UI component directory
└── 📄 README.md - Setup and usage instructions

📦 Dependencies:
• next: ^14.0.0
• react: ^18.0.0
• typescript: ^5.0.0
• tailwindcss: ^3.3.0
• @types/node: ^20.0.0
• @types/react: ^18.0.0

⚙️ Available Parameters:
• app_name (default: "my-nextjs-app") - Application name
• port (default: "3000") - Development server port
• enable_analytics (default: "false") - Enable Next.js analytics

🔧 Generated Scripts:
• npm run dev - Start development server
• npm run build - Build for production
• npm run start - Start production server
• npm run lint - Run ESLint
• npm run type-check - TypeScript validation

📚 Features Included:
• App Router architecture
• TypeScript configuration
• Tailwind CSS setup
• ESLint and Prettier
• Basic component structure
• Development tooling

🚀 Next Steps After Application:
1. Run npm install to install dependencies
2. Configure environment variables if needed
3. Start development with npm run dev
4. Begin building your application features
`
  }]
}
```

#### Parameterized Preview
```typescript
const customPreview = await client.callTool('preview-spike', {
  id: 'fastapi-jwt-auth',
  params: {
    app_name: 'my-secure-api',
    database_url: 'postgresql://localhost/mydb',
    secret_key: 'your-secret-key'
  }
});
```

#### Complex Template Preview
```typescript
const complexPreview = await client.callTool('preview-spike', {
  id: 'nextjs-auth-prisma-complete',
  params: {
    app_name: 'enterprise-dashboard',
    auth_providers: 'google,github,azure',
    database_provider: 'postgresql'
  }
});
```

**Preview Information**:
- **Template Metadata**: Name, version, stack, difficulty level
- **File Structure**: Complete directory and file listing
- **Dependencies**: All required packages and versions
- **Parameters**: Available customization options with defaults
- **Features**: Included functionality and capabilities
- **Setup Instructions**: Post-application steps and configuration

**Natural Language Usage**:
```
"Show me what the React testing template includes"
"Preview the FastAPI authentication spike"
"What files will be generated by the Next.js starter?"
"Show me the full structure of the Docker deployment template"
```

---

### 11. apply-spike

**Purpose**: Applies a spike template to generate files and project structure with conflict resolution.

**Parameters**:
```typescript
{
  id: string                       // Spike template ID (required)
  params?: Record<string, string>  // Template parameters
  strategy?: "overwrite"|"three_way_merge"|"abort"  // Conflict resolution
}
```

**Usage Examples**:

#### Basic Application
```typescript
const application = await client.callTool('apply-spike', {
  id: 'nextjs-minimal',
  params: {
    app_name: 'my-awesome-app',
    port: '3001'
  }
});

// Example response:
{
  content: [{
    type: "text",
    text: `✅ Spike Applied Successfully: nextjs-minimal

📁 Project Structure Created:
my-awesome-app/
├── ✅ package.json (created)
├── ✅ next.config.js (created)
├── ✅ tailwind.config.js (created)
├── ✅ tsconfig.json (created)
├── ✅ app/layout.tsx (created)
├── ✅ app/page.tsx (created)
├── ✅ app/globals.css (created)
├── ✅ components/ui/ (directory created)
└── ✅ README.md (created)

🔧 Configuration Applied:
• Application name: my-awesome-app
• Development port: 3001
• TypeScript: Enabled
• Tailwind CSS: Configured
• ESLint: Configured

📋 Next Steps:
1. Navigate to project: cd my-awesome-app
2. Install dependencies: npm install
3. Start development: npm run dev
4. Open browser: http://localhost:3001

💡 Additional Setup:
• Environment variables: Copy .env.example to .env.local
• Database: Run npm run db:setup if using database
• Authentication: Configure providers in auth.config.js

🧪 Testing:
• Unit tests: npm run test
• E2E tests: npm run test:e2e
• Type checking: npm run type-check
`
  }]
}
```

#### Conflict Resolution
```typescript
// Overwrite existing files
const overwriteApp = await client.callTool('apply-spike', {
  id: 'react-component-lib',
  strategy: 'overwrite',
  params: {
    component_name: 'Button',
    styling_system: 'styled-components'
  }
});

// Three-way merge for intelligent conflict resolution
const mergeApp = await client.callTool('apply-spike', {
  id: 'fastapi-database-integration',
  strategy: 'three_way_merge',
  params: {
    database_type: 'postgresql',
    orm: 'sqlalchemy'
  }
});

// Abort if conflicts detected
const safeApp = await client.callTool('apply-spike', {
  id: 'github-actions-ci',
  strategy: 'abort'
});
```

#### Complex Application with Multiple Parameters
```typescript
const enterpriseApp = await client.callTool('apply-spike', {
  id: 'nextjs-enterprise-starter',
  params: {
    app_name: 'enterprise-dashboard',
    auth_providers: 'azure,okta',
    database_provider: 'postgresql',
    ui_library: 'mui',
    monitoring: 'sentry',
    analytics: 'mixpanel',
    payment_provider: 'stripe',
    deployment_target: 'vercel'
  },
  strategy: 'three_way_merge'
});
```

**Conflict Resolution Strategies**:

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| **overwrite** | Replace existing files completely | Clean slate, starting fresh |
| **three_way_merge** | Intelligent merge with conflict detection | Updating existing projects |
| **abort** | Stop if any conflicts detected | Safety-first approach |

**Generated Artifacts**:
- **Source Files**: Complete application code structure
- **Configuration**: Framework and tool configurations
- **Documentation**: README, setup instructions, usage guides
- **Scripts**: Build, test, development, and deployment scripts
- **Dependencies**: Package.json or equivalent with all required dependencies

**Natural Language Usage**:
```
"Apply the React testing template to my project"
"Generate a FastAPI application with PostgreSQL"
"Create a Next.js app with authentication and database"
"Set up GitHub Actions CI/CD for my repository"
```

---

### 12. validate-spike

**Purpose**: Validates the integrity and quality of an applied spike template.

**Parameters**:
```typescript
{
  id: string                       // Spike template ID (required)
  params?: Record<string, string>  // Template parameters used
}
```

**Usage Examples**:

#### Post-Application Validation
```typescript
const validation = await client.callTool('validate-spike', {
  id: 'nextjs-minimal',
  params: {
    app_name: 'my-awesome-app'
  }
});

// Example response:
{
  content: [{
    type: "text",
    text: `🔍 Spike Validation Results: nextjs-minimal

✅ Validation Summary:
• Template integrity: Valid
• File structure: Complete
• Dependencies: All resolved
• Configuration: Correct
• Scripts: Functional

📋 Detailed Checks:

📁 File Structure Validation:
✅ package.json - Present and valid
✅ next.config.js - Configuration correct
✅ tsconfig.json - TypeScript setup valid
✅ tailwind.config.js - Tailwind properly configured
✅ app/layout.tsx - Layout component valid
✅ app/page.tsx - Page component valid
✅ app/globals.css - Styles properly imported

📦 Dependency Validation:
✅ next: 14.0.0 (latest stable)
✅ react: 18.2.0 (compatible)
✅ typescript: 5.0.0 (recommended)
✅ tailwindcss: 3.3.0 (latest)
✅ All peer dependencies satisfied

⚙️ Configuration Validation:
✅ TypeScript paths configured correctly
✅ Tailwind CSS integrated properly
✅ Next.js app router setup valid
✅ ESLint configuration functional
✅ Build scripts properly defined

🧪 Build System Validation:
✅ npm run build - Executes successfully
✅ npm run dev - Development server starts
✅ npm run lint - Linting passes
✅ npm run type-check - No TypeScript errors

🎯 Template Compliance:
✅ All required files generated
✅ Parameter substitution correct
✅ Best practices implemented
✅ Security configurations applied

💡 Recommendations:
• Consider adding environment variable validation
• Add pre-commit hooks for code quality
• Configure absolute imports for better organization
• Consider adding Storybook for component development

🏆 Overall Score: 95/100 (Excellent)
`
  }]
}
```

#### Failed Validation Example
```typescript
const failedValidation = await client.callTool('validate-spike', {
  id: 'fastapi-complex',
  params: {
    database_url: 'invalid-url'
  }
});

// Example response with issues:
{
  content: [{
    type: "text",
    text: `❌ Spike Validation Results: fastapi-complex

⚠️ Validation Summary:
• Template integrity: Issues found
• File structure: Incomplete
• Dependencies: Conflicts detected
• Configuration: Errors present
• Scripts: Some failures

📋 Issues Detected:

❌ Configuration Issues:
• Database URL format invalid: 'invalid-url'
• Missing required environment variables
• Secret key not properly configured

❌ Dependency Issues:
• Version conflict: pydantic 1.x vs 2.x
• Missing development dependencies
• Requirements.txt malformed

❌ File Issues:
• Missing: alembic/versions/ directory
• Invalid: app/config.py syntax error
• Incomplete: docker-compose.yml configuration

🔧 Required Fixes:
1. Update database_url parameter to valid format
2. Install compatible pydantic version
3. Create missing alembic directories
4. Fix syntax error in config.py
5. Complete Docker configuration

📋 Suggested Actions:
• Re-apply template with correct parameters
• Run: pip install -r requirements.txt
• Initialize database: alembic upgrade head
• Test configuration: python -m pytest

🏆 Overall Score: 45/100 (Needs attention)
`
  }]
}
```

**Validation Categories**:

| Category | Checks | Purpose |
|----------|--------|---------|
| **File Structure** | Completeness, required files, directory structure | Ensures all necessary files are present |
| **Dependencies** | Version compatibility, peer dependencies, conflicts | Verifies dependency integrity |
| **Configuration** | Syntax, required settings, environment variables | Validates configuration correctness |
| **Build System** | Script execution, compilation, type checking | Tests build and development workflows |
| **Template Compliance** | Parameter substitution, best practices, security | Ensures template standards are met |

**Natural Language Usage**:
```
"Validate my applied Next.js template"
"Check if the FastAPI spike was applied correctly"
"Verify the integrity of my generated project"
"Test the configuration of my applied template"
```

---

### 13. explain-spike

**Purpose**: Provides comprehensive explanation of spike template purpose, usage, and best practices.

**Parameters**:
```typescript
{
  id: string                       // Spike template ID (required)
}
```

**Usage Examples**:

#### Template Documentation
```typescript
const explanation = await client.callTool('explain-spike', {
  id: 'nextjs-auth-nextauth-credentials'
});

// Example response:
{
  content: [{
    type: "text",
    text: `📚 Spike Explanation: nextjs-auth-nextauth-credentials

🎯 Purpose:
Provides a complete Next.js authentication system using NextAuth.js with custom credentials provider. This template is designed for applications that need user authentication with email/password login, session management, and protected routes.

🏗️ Architecture Overview:
• Frontend: Next.js 14 with App Router
• Authentication: NextAuth.js v4 with credentials provider
• Session: JWT tokens with secure session handling
• Database: Compatible with any database supported by NextAuth.js
• UI: Pre-built login/register forms with Tailwind CSS

📦 Key Components:

1. 🔐 Authentication Provider Setup:
   • Custom credentials provider configuration
   • Email/password validation logic
   • User session callbacks
   • JWT token customization

2. 🛡️ Security Features:
   • Password hashing with bcryptjs
   • CSRF protection enabled
   • Secure cookie configuration
   • Session token encryption

3. 🎨 UI Components:
   • Login form with validation
   • Registration form
   • User profile page
   • Protected route examples

4. 🔄 Session Management:
   • Server-side session validation
   • Client-side session hooks
   • Automatic token refresh
   • Logout functionality

📁 File Structure Details:

app/auth/
├── login/page.tsx - Login page with form
├── register/page.tsx - Registration page
└── profile/page.tsx - Protected user profile

lib/auth/
├── config.ts - NextAuth.js configuration
├── providers.ts - Authentication providers
└── utils.ts - Authentication utilities

components/auth/
├── LoginForm.tsx - Reusable login component
├── RegisterForm.tsx - Registration component
└── UserProfile.tsx - User profile display

middleware.ts - Route protection middleware

⚙️ Configuration Parameters:

• app_name (string): Application name for branding
• database_provider (enum): mongodb|postgresql|mysql|sqlite
• enable_registration (boolean): Allow new user registration
• session_strategy (enum): jwt|database
• secret_key (string): NextAuth.js secret for encryption
• allowed_domains (array): Email domain restrictions

🛠️ Setup Instructions:

1. 📋 Environment Variables:
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   DATABASE_URL=your-database-connection

2. 🗄️ Database Setup:
   • Run database migrations
   • Create users table
   • Configure connection pooling

3. 🔧 Provider Configuration:
   • Update credentials validation logic
   • Configure session callbacks
   • Set up user registration flow

📚 Best Practices:

1. 🔐 Security:
   • Use strong, unique secret keys
   • Implement rate limiting on auth endpoints
   • Validate and sanitize all user inputs
   • Use HTTPS in production

2. 🎨 User Experience:
   • Provide clear error messages
   • Implement loading states
   • Add remember me functionality
   • Include password strength indicators

3. 🧪 Testing:
   • Test authentication flows
   • Validate session persistence
   • Check protected route access
   • Test password reset functionality

4. 📊 Monitoring:
   • Log authentication attempts
   • Monitor failed login rates
   • Track session durations
   • Alert on suspicious activity

🔗 Integration Examples:

1. Protected API Routes:
   import { getServerSession } from 'next-auth';
   
   export async function GET() {
     const session = await getServerSession();
     if (!session) return new Response('Unauthorized', { status: 401 });
     // ... protected logic
   }

2. Client-Side Protection:
   import { useSession } from 'next-auth/react';
   
   function ProtectedComponent() {
     const { data: session, status } = useSession();
     if (status === 'loading') return <Loading />;
     if (!session) return <LoginPrompt />;
     return <ProtectedContent />;
   }

🚀 Common Use Cases:
• SaaS applications with user accounts
• E-commerce platforms with customer login
• Content management systems
• Member-only websites
• Dashboard applications

⚠️ Considerations:
• Database schema requirements
• Email service integration for verification
• Password reset flow implementation
• Multi-factor authentication addition
• Social login provider integration

🔄 Extension Points:
• Add OAuth providers (Google, GitHub, etc.)
• Implement role-based access control
• Add user profile management
• Include email verification
• Add password reset functionality

📈 Performance Tips:
• Use session strategy appropriate for scale
• Implement proper caching for user data
• Optimize database queries
• Use CDN for static authentication assets

🏆 Template Maturity: Production-ready
📊 Complexity Level: Intermediate
⏱️ Setup Time: 15-30 minutes
🎯 Best For: Medium to large applications requiring custom authentication
`
  }]
}
```

#### Simple Template Explanation
```typescript
const simpleExplanation = await client.callTool('explain-spike', {
  id: 'react-component-minimal'
});
```

#### Complex Template Explanation
```typescript
const complexExplanation = await client.callTool('explain-spike', {
  id: 'fastapi-microservices-k8s'
});
```

**Explanation Sections**:

| Section | Content | Purpose |
|---------|---------|---------|
| **Purpose** | Template objectives and use cases | Understanding when to use |
| **Architecture** | Technical stack and structure | System design overview |
| **Components** | Key files and their roles | Implementation details |
| **Configuration** | Available parameters and options | Customization guidance |
| **Setup** | Step-by-step implementation | Getting started |
| **Best Practices** | Recommended patterns and approaches | Quality implementation |
| **Integration** | Code examples and patterns | Practical usage |
| **Extensions** | Possible enhancements and additions | Future development |

**Natural Language Usage**:
```
"Explain how the React testing template works"
"What does the FastAPI authentication spike include?"
"Show me the best practices for the Next.js starter"
"How do I use the Docker deployment template?"
```

---

## Diagnostic Tools

### 14. self-test

**Purpose**: Runs comprehensive self-diagnostic tests to verify MCP server functionality.

**Parameters**: None

**Usage Examples**:

#### Basic Self-Test
```typescript
const selfTest = await client.callTool('self-test', {});

// Example response:
{
  content: [{
    type: "text",
    text: "✅ Self-test passed"
  }]
}
```

#### Detailed Test Information
The self-test internally performs these operations:
1. **Catalog Access**: Tests specification listing functionality
2. **Write Operations**: Creates and updates test specifications
3. **Read Operations**: Retrieves specifications via resource interface
4. **Filter Operations**: Tests filtered specification listing
5. **Statistics**: Validates catalog statistics generation

**Test Scenarios**:
- Empty catalog handling
- Specification creation and retrieval
- Filter functionality validation
- Error handling verification
- Performance baseline measurement

**Natural Language Usage**:
```
"Run a self-test to check if everything is working"
"Test the MCP server functionality"
"Verify that Fluorite MCP is operational"
"Check server health status"
```

---

### 15. performance-test

**Purpose**: Measures and reports MCP server performance metrics with threshold validation.

**Parameters**: None

**Usage Examples**:

#### Performance Measurement
```typescript
const perfTest = await client.callTool('performance-test', {});

// Example response:
{
  content: [{
    type: "text",
    text: "✅ Performance test completed"
  }]
}
```

#### Performance Thresholds
The performance test validates against these thresholds:
- **list-specs**: < 200ms response time
- **upsert-spec**: < 500ms response time  
- **spec-resource**: < 100ms response time

**Measured Metrics**:
- Operation response times
- Memory usage patterns
- Throughput capabilities
- Error rates under load
- Cache effectiveness

**Performance Categories**:

| Operation | Threshold | Typical Performance | Optimization Notes |
|-----------|-----------|-------------------|-------------------|
| **List Specs** | 200ms | ~50ms | Cached after first access |
| **Upsert Spec** | 500ms | ~100ms | Depends on spec size |
| **Read Resource** | 100ms | ~10ms | File system dependent |
| **Static Analysis** | 10s | ~2s | Project size dependent |

**Natural Language Usage**:
```
"Run a performance test on the server"
"Check how fast the MCP operations are"
"Measure server response times"
"Test performance benchmarks"
```

---

### 16. server-metrics

**Purpose**: Displays comprehensive server observability and performance metrics.

**Parameters**: None

**Usage Examples**:

#### Metrics Collection
```typescript
const metrics = await client.callTool('server-metrics', {});

// Example response:
{
  content: [{
    type: "text",
    text: `📊 Server Metrics:
{
  "uptime": 3600,
  "operations": {
    "list-specs": {
      "count": 145,
      "avgTime": 23,
      "p95Time": 67,
      "errors": 0
    },
    "upsert-spec": {
      "count": 28,
      "avgTime": 89,
      "p95Time": 234,
      "errors": 1
    },
    "spec-resource": {
      "count": 892,
      "avgTime": 12,
      "p95Time": 34,
      "errors": 3
    }
  },
  "memory": {
    "used": "45MB",
    "heap": "67MB",
    "external": "12MB"
  },
  "cache": {
    "hitRate": 0.85,
    "size": "15MB",
    "entries": 234
  }
}`
  }]
}
```

**Metric Categories**:

| Category | Metrics | Purpose |
|----------|---------|---------|
| **Performance** | Response times, throughput, latency percentiles | Monitor operation speed |
| **Resource Usage** | Memory, CPU, disk I/O | Track resource consumption |
| **Reliability** | Error rates, success rates, availability | Monitor service health |
| **Cache** | Hit rates, eviction rates, memory usage | Optimize performance |
| **Operations** | Request counts, operation distribution | Usage analytics |

**Monitoring Use Cases**:
- **Production Monitoring**: Track server health in deployed environments
- **Performance Tuning**: Identify optimization opportunities
- **Capacity Planning**: Understand resource requirements
- **Debugging**: Diagnose performance issues and bottlenecks
- **SLA Monitoring**: Ensure service level agreements are met

**Natural Language Usage**:
```
"Show me server performance metrics"
"What's the current server status?"
"Display observability data"
"Check server resource usage"
```

---

## Error Handling

### Common Error Patterns

#### Specification Not Found
```typescript
// Error response format
{
  content: [{
    type: "text",
    text: "Specification 'unknown-lib' not found. Available specifications: ..."
  }],
  isError: true
}
```

#### Invalid Parameters
```typescript
// Parameter validation error
{
  content: [{
    type: "text",
    text: "Invalid parameters: 'code' field is required for quick-validate"
  }],
  isError: true
}
```

#### File System Errors
```typescript
// File access error
{
  content: [{
    type: "text",
    text: "Error reading specification: Permission denied accessing catalog directory"
  }],
  isError: true
}
```

### Error Recovery Strategies

1. **Graceful Degradation**: Continue operation with reduced functionality
2. **Automatic Retry**: Retry failed operations with exponential backoff
3. **Fallback Options**: Provide alternative approaches when primary method fails
4. **Clear Messaging**: Detailed error messages with suggested solutions
5. **Context Preservation**: Maintain operation context for debugging

---

## Best Practices

### Function Selection Guidelines

1. **Specification Management**:
   - Use `list-specs` for discovery and browsing
   - Use `upsert-spec` for adding custom libraries
   - Use `catalog-stats` for diagnostics and monitoring

2. **Static Analysis**:
   - Use `static-analysis` for comprehensive project analysis
   - Use `quick-validate` for rapid code snippet validation
   - Use `realtime-validation` for active development with watch mode
   - Use `get-validation-rules` to understand available checks

3. **Spike Development**:
   - Start with `discover-spikes` or `auto-spike` for template selection
   - Use `preview-spike` before applying templates
   - Apply templates with `apply-spike` and appropriate conflict resolution
   - Validate results with `validate-spike`
   - Use `explain-spike` for detailed documentation

4. **Diagnostics**:
   - Use `self-test` for basic health verification
   - Use `performance-test` for performance validation
   - Use `server-metrics` for detailed monitoring

### Parameter Best Practices

1. **Required vs Optional**: Always provide required parameters, use defaults for optional ones
2. **Validation**: Validate parameters client-side before API calls
3. **Security**: Sanitize user inputs, especially for file paths and code content
4. **Performance**: Use filters and limits to optimize response sizes
5. **Error Handling**: Implement proper error handling for all API calls

### Integration Patterns

1. **Batch Operations**: Group related operations for better performance
2. **Caching**: Cache frequently accessed specifications and validation results
3. **Progressive Enhancement**: Start with basic functionality, add advanced features gradually
4. **Error Recovery**: Implement fallback strategies for critical operations
5. **Monitoring**: Use diagnostic tools to monitor integration health

---

*Function Reference v0.12.1 - Last updated: January 2025*
# Command Reference

This guide covers all available commands, features, and usage patterns for Fluorite MCP with Claude Code CLI.

## 📖 Table of Contents

- [Natural Language Commands](#natural-language-commands)
- [Library Specifications](#library-specifications)
- [Static Analysis Commands](#static-analysis-commands)
- [Spike Development Commands](#spike-development-commands)
- [Direct MCP Tools](#direct-mcp-tools)
- [Advanced Usage Patterns](#advanced-usage-patterns)

## Natural Language Commands

Fluorite MCP works transparently with Claude Code CLI through natural language. Simply describe what you want to build, and Claude will automatically access relevant specifications.

## `/fl:ui` Command - v0.io-Style UI Generation

The `/fl:ui` command provides v0.io-style natural language UI component generation with TailwindCSS v4.1+ and shadcn/ui v2+ integration.

### Quick Examples

```bash
# Generate a login form
fluorite-mcp ui "Create a modern login form with email and password"

# Generate a data table  
fluorite-mcp ui "Build an advanced data table with sorting and filtering"

# Generate with specific framework
fluorite-mcp ui "Create a responsive modal dialog" --framework next --preview

# Generate with custom styling
fluorite-mcp ui "Make a dashboard with charts" --style glass --dark
```

### Features

- **🤖 Natural Language Processing**: Analyzes descriptions to determine component type and complexity
- **🎨 Modern UI Generation**: Creates TypeScript components with TailwindCSS v4.1+ and shadcn/ui v2+
- **🚀 Framework Support**: React, Next.js, and Vue components
- **♿ Accessibility**: WCAG 2.1 AA compliant components by default
- **📱 Responsive Design**: Mobile-first responsive components
- **🌙 Dark Mode**: Optional dark mode support
- **📊 Component Statistics**: Lines of code, dependencies, and accessibility scores

### Component Types Detected

- **Forms**: login, signup, contact forms
- **Tables**: data tables with sorting/filtering  
- **Modals**: dialogs, popups, overlays
- **Navigation**: menus, navbars, breadcrumbs
- **Cards**: content cards, metric cards
- **Buttons**: various button types and variants
- **Dashboards**: analytics dashboards with charts
- **Custom**: any other component description

### Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--framework` | Target framework (react/next/vue) | `react` |
| `--style` | Design style (modern/minimal/glass/card) | `modern` |
| `--preview` | Preview without writing files | `false` |
| `--dark` | Include dark mode support | `false` |
| `--component-name` | Custom component name | Auto-detected |
| `--output` | Output directory | `./components` |

See [UI Command Documentation](./ui-command.md) for complete details.

### UI Component Development

#### Basic Component Creation

```
Create a button component using shadcn/ui with variants
```

**What happens**:
- Accesses `spec://shadcn__ui`
- Includes proper TypeScript types
- Adds variant support (default, destructive, outline, secondary, ghost, link)
- Includes accessibility attributes
- Uses Tailwind CSS classes

#### Advanced Component Patterns

```
Build a data table with sorting, filtering, and pagination using TanStack Table
```

**Result**: 
- Uses `spec://tanstack-table`
- Implements proper column definitions
- Adds server-side sorting/filtering
- Includes TypeScript interfaces
- Responsive design patterns

#### Form Components

```
Create a form with react-hook-form, Zod validation, and shadcn/ui components
```

**Features**:
- react-hook-form integration
- Zod schema validation
- Error message handling
- Accessibility compliance
- Type-safe form data

### API Development

#### REST API Creation

```
Create a FastAPI endpoint with JWT authentication and Pydantic models
```

**Includes**:
- JWT token handling
- Pydantic request/response models
- Error handling middleware
- OpenAPI documentation
- Type hints and validation

#### Database Integration

```
Set up a Next.js API route with Prisma and PostgreSQL
```

**Features**:
- Prisma client setup
- Database connection handling
- CRUD operations
- Error handling
- Type-safe database queries

### Authentication Systems

#### NextAuth.js Setup

```
Implement authentication with NextAuth.js using Google and GitHub providers
```

**Includes**:
- Provider configuration
- Session handling
- Middleware setup
- Type definitions
- Security best practices

#### Custom Auth Implementation

```
Build a custom authentication system with JWT and refresh tokens
```

**Features**:
- Token generation/validation
- Refresh token rotation
- Secure cookie handling
- Rate limiting
- Session management

### Testing Commands

#### End-to-End Testing

```
Set up Playwright testing with accessibility checks and visual regression
```

**Includes**:
- Playwright configuration
- Accessibility testing with axe
- Visual regression setup
- CI/CD integration
- Parallel test execution

#### Unit Testing Setup

```
Configure Vitest with React Testing Library for component testing
```

**Features**:
- Vitest configuration
- Testing utilities
- Mock implementations
- Coverage reporting
- CI integration

## Library Specifications

Access detailed specifications for 87+ libraries using natural language or direct references.

### AI SDK (Vercel)

- Reference: `spec://vercel-ai-sdk` — see docs/specs/vercel-ai-sdk.md
- Use cases: server-side streaming via `streamText` with `toAIStreamResponse()`, typed outputs via Zod tools, embeddings via `embed`
- Providers: import only what you need (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, etc.)

### Core Libraries

| Library | Natural Language Example | Direct Access |
|---------|-------------------------|---------------|
| **shadcn/ui** | "Create UI components with shadcn/ui" | `spec://shadcn__ui` |
| **TanStack Table** | "Build a data table" | `spec://tanstack-table` |
| **NextAuth.js** | "Set up authentication" | `spec://nextauth` |
| **Prisma** | "Configure database with Prisma" | `spec://prisma` |
| **Zod** | "Add form validation" | `spec://zod` |

### State Management

```
Implement global state management with Zustand
```

**Available Libraries**:
- **Zustand**: `spec://zustand` - Lightweight state management
- **Jotai**: `spec://jotai` - Atomic state management  
- **TanStack Query**: `spec://tanstack-query` - Server state management
- **Redux Toolkit**: Advanced state management patterns

### Form Libraries

```
Create complex forms with validation and type safety
```

**Options**:
- **react-hook-form**: `spec://react-hook-form` - Performant forms
- **Zod**: `spec://zod` - Schema validation
- **Valibot**: Alternative validation library
- **Yup**: Traditional validation

### Data Visualization

```
Create interactive charts and dashboards
```

**Libraries**:
- **Recharts**: `spec://recharts` - React chart library
- **D3.js**: Custom visualizations
- **Chart.js**: Canvas-based charts
- **Tremor**: Dashboard components

## Static Analysis Commands

Fluorite MCP includes comprehensive static analysis capabilities.

### Framework-Specific Analysis

#### Next.js Analysis

```
Analyze my Next.js project for common issues and performance problems
```

**Detects**:
- Client hooks in Server Components
- Hydration mismatches  
- Image optimization issues
- Route configuration problems
- Performance anti-patterns

#### React Analysis

```
Check this React component for best practices and potential bugs
```

**Checks**:
- Hook usage patterns
- Component lifecycle issues
- State management problems
- Performance optimizations
- Accessibility concerns

#### Vue Analysis

```
Analyze this Vue.js application for Composition API issues
```

**Identifies**:
- Reactivity problems
- Lifecycle management
- Component communication
- Performance bottlenecks
- TypeScript integration

### Error Prediction

```
Predict potential runtime errors in this code
```

**Predictions Include**:
- Hydration errors
- Type mismatches
- Async operation failures
- Memory leaks
- Performance degradation

### Custom Analysis Rules

```
Run static analysis with custom rules for my project
```

**Configurable Rules**:
- Team coding standards
- Framework-specific patterns
- Security requirements
- Performance budgets
- Accessibility compliance

## Spike Development Commands

Rapid prototyping and experimentation using spike templates.

### Discovering Spikes

```
I need to experiment with drag-and-drop functionality
```

**Response**: Claude will suggest relevant spike templates and rapid prototyping approaches.

#### Available Spike Categories

| Category | Count | Example Templates |
|----------|-------|-------------------|
| **Next.js** | 15+ | Minimal app, API routes, Authentication |
| **FastAPI** | 15+ | REST APIs, Background tasks, JWT auth |
| **GitHub Actions** | 10+ | CI/CD, Testing pipelines, Deployment |
| **Playwright** | 8+ | E2E testing, Accessibility, Visual regression |

### Creating Quick Prototypes

#### Next.js Spikes

```
Create a minimal Next.js app to test server-side rendering
```

**Available Templates**:
- `nextjs-minimal`: Basic SSR setup
- `nextjs-api-hello`: Simple API route
- `nextjs-auth-nextauth-credentials`: Auth testing
- `nextjs-prisma-sqlite-crud`: Database operations

#### API Development Spikes

```
Test FastAPI with database integration
```

**Templates**:
- `fastapi-minimal`: Basic FastAPI setup
- `fastapi-sqlmodel-sqlite`: Database integration
- `fastapi-jwt-auth`: Authentication testing
- `fastapi-websockets`: Real-time communication

#### Testing Spikes

```
Experiment with Playwright accessibility testing
```

**Options**:
- `playwright-minimal`: Basic test setup
- `playwright-axe-accessibility`: Accessibility testing
- `playwright-visual-regression`: Visual testing
- `playwright-docker-ci`: CI/CD integration

### Spike Workflow Commands

#### 1. Discovery Phase

```
What spike templates are available for React state management?
```

#### 2. Preview Phase

```
Show me what the nextjs-auth-spike template includes
```

#### 3. Implementation Phase

```
Apply the fastapi-jwt-auth spike to test authentication
```

#### 4. Validation Phase

```
Help me validate this spike implementation
```

## Direct MCP Tools

For advanced users, direct access to MCP tools:

### Specification Management

#### List Specifications

Direct call: `list-specs`

```
Show me all available library specifications
```

#### Filter Specifications

```
List all React-related specifications
```

#### Get Specific Specification

```
Show me the detailed Prisma specification
```

### Catalog Operations

#### Add Custom Specification

Direct call: `upsert-spec`

```
Add a custom library specification for my internal tools
```

#### Catalog Statistics

Direct call: `catalog-stats`

```
Show me statistics about the specification catalog
```

### Analysis Tools

#### Project Analysis

Direct call: `static-analysis`

```
Run comprehensive static analysis on my project
```

Parameters:
- `projectPath`: Project directory
- `framework`: Target framework (nextjs, react, vue)
- `predictErrors`: Enable error prediction
- `analyzeDependencies`: Analyze dependencies

#### Code Validation

Direct call: `quick-validate`

```
Validate this code snippet
```

Parameters:
- `code`: Code to validate
- `language`: Programming language
- `framework`: Framework context

### Diagnostics

#### Server Health Check

Direct call: `self-test`

```
Check if Fluorite MCP is working correctly
```

#### Performance Metrics

Direct call: `performance-test`

```
Show performance metrics for the MCP server
```

#### Server Metrics

Direct call: `server-metrics`

```
Display server observability data
```

## Advanced Usage Patterns

### Multi-Library Integration

```
Create a full-stack app with Next.js, Prisma, NextAuth.js, and TanStack Query
```

**Result**: Claude orchestrates multiple specifications to create a cohesive application.

### Framework Migration

```
Help me migrate from Create React App to Next.js
```

**Process**: 
- Analyzes current structure
- Identifies migration points
- Suggests step-by-step approach
- Provides compatibility guidance

### Performance Optimization

```
Optimize this React app for Core Web Vitals
```

**Analysis**:
- Bundle size optimization
- Code splitting strategies
- Image optimization
- Caching recommendations

### Security Hardening

```
Audit my authentication implementation for security vulnerabilities
```

**Checks**:
- Token handling
- Session management
- Input validation
- Access control

### Accessibility Compliance

```
Make this component WCAG 2.1 AA compliant
```

**Improvements**:
- Semantic markup
- Keyboard navigation
- Screen reader support
- Color contrast

## Command Patterns and Tips

### Best Practices

#### 1. Be Specific with Technology Stack

```
✅ "Create a form with react-hook-form, Zod validation, and shadcn/ui components"
❌ "Create a form"
```

#### 2. Mention Framework Context

```
✅ "Build a Next.js API route with tRPC and Prisma"
❌ "Build an API"
```

#### 3. Include Requirements

```
✅ "Create a data table with sorting, filtering, pagination, and TypeScript"
❌ "Create a table"
```

#### 4. Ask for Best Practices

```
✅ "What are the security best practices for NextAuth.js implementation?"
✅ "Show me performance optimizations for this React component"
```

### Common Command Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| **Create + Library** | "Create X using Y" | New component/feature |
| **Setup + Framework** | "Set up X with Y and Z" | Environment configuration |
| **Analyze + Context** | "Analyze this X for Y issues" | Code review/debugging |
| **Optimize + Metric** | "Optimize X for Y performance" | Performance improvement |
| **Migrate + Direction** | "Migrate from X to Y" | Technology transitions |

### Integration Commands

#### Database Operations

```
Set up Prisma with PostgreSQL and generate CRUD operations
```

#### API Integration

```
Create tRPC procedures with Zod validation and Prisma queries
```

#### State Management

```
Implement global state with Zustand and persist to localStorage
```

#### Styling Systems

```
Configure Tailwind CSS with shadcn/ui and custom design tokens
```

## Error Handling and Troubleshooting

### Common Issues

#### 1. Specification Not Found

```
Error: Specification 'unknown-lib' not found
```

**Solution**: Use `List all available specifications` to find correct names.

#### 2. Invalid Parameters

```
Error: Invalid parameters for static analysis
```

**Solution**: Check parameter requirements in API documentation.

#### 3. Analysis Timeout

```
Error: Static analysis timed out
```

**Solution**: Try analyzing smaller code sections or specific files.

### Debug Commands

```
Why isn't Claude using the React specification?
```

```
Show me the exact specification being used for this request
```

```
Check if Fluorite MCP is working properly
```

## Next Steps

- **[Spike Templates Guide](./spike-templates.md)** - Learn rapid prototyping
- **[API Documentation](../API.md)** - Complete technical reference
- **[Developer Guide](./developer.md)** - Advanced customization
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

---

*Last updated: 2025-08-15*

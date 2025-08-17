# Spike Templates - Complete Guide

## Overview

Spike templates are production-ready code scaffolds that accelerate development by providing battle-tested implementations for common patterns. With 750+ templates covering authentication, APIs, testing, deployment, and more, you can go from idea to working code in seconds.

## What Are Spike Templates?

Spike templates are:
- **Production-Ready**: Every template is tested and follows best practices
- **Parameterizable**: Customize templates with your project-specific values
- **Framework-Native**: Templates follow framework conventions and patterns
- **Type-Safe**: Include TypeScript definitions and proper typing
- **Secure**: Built-in security best practices and vulnerability prevention

## Template Discovery

### Natural Language Search
```bash
# Describe what you need in plain English
fluorite-mcp discover "authentication system with JWT"
fluorite-mcp discover "React form with validation"
fluorite-mcp discover "REST API with PostgreSQL"
```

### Intelligent Auto-Selection
```bash
# Let AI choose the best template for your task
fluorite-mcp auto-spike "Create a login system for my Next.js app"
```

### Browse by Category
```bash
# List all authentication templates
fluorite-mcp discover --category authentication

# List all testing templates
fluorite-mcp discover --category testing

# List templates for specific framework
fluorite-mcp discover --stack nextjs
```

## Template Categories

### 🔐 Authentication & Authorization (58 templates)

#### JWT Authentication
- `fastapi-jwt-auth`: FastAPI with JWT tokens
- `express-jwt-auth`: Express.js JWT implementation
- `nextjs-jwt-custom`: Next.js custom JWT auth
- `nestjs-jwt-passport`: NestJS with Passport JWT

#### OAuth Providers
- `nextauth-google`: Google OAuth with NextAuth.js
- `nextauth-github`: GitHub OAuth integration
- `clerk-complete`: Clerk authentication setup
- `supabase-auth`: Supabase authentication

#### Session Management
- `express-session-redis`: Redis-backed sessions
- `fastapi-session-cookies`: Cookie-based sessions
- `nextjs-iron-session`: Encrypted session cookies

### 🌐 API Development (89 templates)

#### REST APIs
- `express-rest-crud`: Complete CRUD API
- `fastapi-async-postgres`: Async FastAPI with PostgreSQL
- `hono-cloudflare-workers`: Edge API with Hono
- `nestjs-prisma-rest`: NestJS with Prisma ORM

#### GraphQL
- `apollo-server-express`: Apollo Server setup
- `graphql-yoga-nextjs`: GraphQL Yoga integration
- `pothos-graphql-schema`: Type-safe GraphQL with Pothos

#### Real-time
- `socketio-chat`: Real-time chat with Socket.IO
- `websocket-notifications`: WebSocket notifications
- `server-sent-events`: SSE implementation

### 🎨 Frontend Components (45 templates)

#### Forms
- `react-hook-form-zod`: Form with Zod validation
- `formik-yup-validation`: Formik with Yup schemas
- `vue-vee-validate`: Vue.js form validation

#### UI Components
- `shadcn-data-table`: Advanced data table
- `radix-ui-dialog`: Accessible modal dialog
- `mantine-dashboard`: Complete dashboard layout

#### State Management
- `zustand-persist`: Persistent global state
- `jotai-atoms`: Atomic state management
- `tanstack-query-infinite`: Infinite scrolling with React Query

### 🧪 Testing (58 templates)

#### Unit Testing
- `vitest-react-testing`: React component testing
- `jest-express-api`: API endpoint testing
- `pytest-fastapi`: FastAPI test suite

#### E2E Testing
- `playwright-auth-flow`: Authentication E2E tests
- `cypress-component`: Component testing setup
- `puppeteer-screenshot`: Visual regression testing

#### Performance Testing
- `k6-load-testing`: Load testing scripts
- `lighthouse-ci`: Performance CI pipeline
- `artillery-stress-test`: Stress testing configuration

### 🏗️ Infrastructure (40 templates)

#### Docker
- `dockerfile-node-multi`: Multi-stage Node.js build
- `docker-compose-full-stack`: Complete stack setup
- `dockerfile-python-slim`: Optimized Python image

#### CI/CD
- `github-actions-deploy`: Deployment workflow
- `gitlab-ci-pipeline`: GitLab CI configuration
- `jenkins-pipeline`: Jenkinsfile setup

#### Kubernetes
- `k8s-deployment`: Basic deployment config
- `helm-chart-app`: Helm chart scaffold
- `k8s-ingress-tls`: Ingress with TLS

### 📊 Databases (52 templates)

#### SQL
- `prisma-postgresql`: Prisma with PostgreSQL
- `drizzle-mysql`: Drizzle ORM setup
- `typeorm-migrations`: TypeORM with migrations

#### NoSQL
- `mongodb-mongoose`: MongoDB with Mongoose
- `redis-cache-layer`: Redis caching implementation
- `dynamodb-crud`: DynamoDB operations

#### Migrations
- `knex-migrations`: Knex migration system
- `prisma-seed-data`: Database seeding
- `flyway-versioning`: Database versioning

## Template Structure

### Anatomy of a Template

```json
{
  "id": "nextjs-auth-nextauth-credentials",
  "name": "Next.js Authentication with NextAuth.js",
  "version": "1.0.0",
  "description": "Complete authentication system with email/password",
  
  "stack": ["nextjs", "nextauth", "typescript", "prisma"],
  "tags": ["authentication", "jwt", "session", "security"],
  
  "params": [
    {
      "name": "app_name",
      "required": true,
      "description": "Application name",
      "default": "my-app"
    },
    {
      "name": "database_url",
      "required": false,
      "description": "PostgreSQL connection string",
      "default": "postgresql://localhost/mydb"
    }
  ],
  
  "files": [
    {
      "path": "{{app_name}}/app/api/auth/[...nextauth]/route.ts",
      "content": "// NextAuth.js configuration..."
    },
    {
      "path": "{{app_name}}/lib/auth.ts",
      "content": "// Authentication utilities..."
    }
  ],
  
  "patches": [
    {
      "path": "package.json",
      "diff": "+ \"next-auth\": \"^4.24.0\""
    }
  ],
  
  "commands": [
    "npm install",
    "npx prisma generate",
    "npx prisma db push"
  ],
  
  "documentation": "## Setup Instructions\n\n1. Configure environment variables..."
}
```

### Template Parameters

Parameters allow customization of templates:

```typescript
interface TemplateParam {
  name: string;           // Parameter name (used in templates as {{name}})
  required: boolean;      // Whether parameter is mandatory
  description: string;    // Human-readable description
  default?: string;       // Default value if not provided
  type?: 'string' | 'number' | 'boolean' | 'array';
  enum?: string[];        // Allowed values for validation
  pattern?: string;       // Regex pattern for validation
}
```

### File Templates

Templates can create multiple files:

```typescript
interface FileTemplate {
  path: string;           // File path (supports {{params}})
  content?: string;       // File content (supports {{params}})
  template?: string;      // Alternative to content
  encoding?: string;      // File encoding (default: utf-8)
  mode?: string;         // File permissions (Unix)
}
```

### Patches

Patches modify existing files:

```typescript
interface PatchTemplate {
  path: string;           // File to patch
  diff: string;          // Unified diff format
  strategy?: 'merge' | 'replace' | 'append';
}
```

## Using Templates

### Basic Usage

```bash
# 1. Discover available templates
fluorite-mcp discover "authentication"

# 2. Preview a template
fluorite-mcp preview nextjs-auth-nextauth-credentials

# 3. Apply the template
fluorite-mcp apply nextjs-auth-nextauth-credentials \
  --param app_name=my-app \
  --param database_url=postgresql://localhost/mydb
```

### Advanced Usage

#### Custom Parameters
```bash
# Pass multiple parameters
fluorite-mcp apply fastapi-jwt-auth \
  --param project_name=my-api \
  --param secret_key=$(openssl rand -hex 32) \
  --param algorithm=HS256 \
  --param token_expiry=3600
```

#### Merge Strategies
```bash
# Three-way merge (default) - intelligent conflict resolution
fluorite-mcp apply template-id --strategy three_way_merge

# Overwrite - replace existing files
fluorite-mcp apply template-id --strategy overwrite

# Abort - stop on any conflict
fluorite-mcp apply template-id --strategy abort
```

#### Dry Run
```bash
# Preview changes without applying
fluorite-mcp apply template-id --dry-run
```

## Creating Custom Templates

### Template Development Workflow

1. **Create Template Structure**
```bash
# Generate template scaffold
fluorite-mcp create-template my-custom-template
```

2. **Define Template Metadata**
```json
{
  "id": "my-custom-template",
  "name": "My Custom Template",
  "version": "1.0.0",
  "description": "Description of what this template does",
  "stack": ["react", "typescript"],
  "tags": ["custom", "internal"]
}
```

3. **Add Parameters**
```json
"params": [
  {
    "name": "component_name",
    "required": true,
    "description": "React component name",
    "pattern": "^[A-Z][a-zA-Z0-9]*$"
  }
]
```

4. **Create File Templates**
```json
"files": [
  {
    "path": "src/components/{{component_name}}/{{component_name}}.tsx",
    "content": "import React from 'react';\n\nexport const {{component_name}}: React.FC = () => {\n  return <div>{{component_name}}</div>;\n};"
  }
]
```

5. **Test Template**
```bash
# Validate template
fluorite-mcp validate-template my-custom-template

# Test application
fluorite-mcp apply my-custom-template --test
```

### Template Best Practices

1. **Use Semantic IDs**: Choose descriptive, searchable IDs
2. **Comprehensive Metadata**: Include stack, tags, and description
3. **Parameter Validation**: Use patterns and enums for validation
4. **Documentation**: Include setup instructions and examples
5. **Version Control**: Version templates for backward compatibility
6. **Test Coverage**: Include test files in templates
7. **Security First**: Include security best practices by default

## Template Examples

### Example 1: React Component Template

```json
{
  "id": "react-component-typescript",
  "name": "React TypeScript Component",
  "files": [
    {
      "path": "{{component_name}}/{{component_name}}.tsx",
      "content": "import React from 'react';\nimport styles from './{{component_name}}.module.css';\n\ninterface {{component_name}}Props {\n  // Add props here\n}\n\nexport const {{component_name}}: React.FC<{{component_name}}Props> = (props) => {\n  return (\n    <div className={styles.container}>\n      <h1>{{component_name}}</h1>\n    </div>\n  );\n};"
    },
    {
      "path": "{{component_name}}/{{component_name}}.module.css",
      "content": ".container {\n  /* Add styles here */\n}"
    },
    {
      "path": "{{component_name}}/{{component_name}}.test.tsx",
      "content": "import { render, screen } from '@testing-library/react';\nimport { {{component_name}} } from './{{component_name}}';\n\ndescribe('{{component_name}}', () => {\n  it('renders correctly', () => {\n    render(<{{component_name}} />);\n    expect(screen.getByText('{{component_name}}')).toBeInTheDocument();\n  });\n});"
    },
    {
      "path": "{{component_name}}/index.ts",
      "content": "export { {{component_name}} } from './{{component_name}}';"
    }
  ]
}
```

### Example 2: API Endpoint Template

```json
{
  "id": "express-crud-endpoint",
  "name": "Express CRUD Endpoint",
  "files": [
    {
      "path": "routes/{{resource_name}}.ts",
      "content": "import { Router } from 'express';\nimport { z } from 'zod';\n\nconst router = Router();\n\n// Validation schemas\nconst {{resource_name}}Schema = z.object({\n  // Define schema\n});\n\n// GET /{{resource_name}}\nrouter.get('/', async (req, res) => {\n  // Implementation\n});\n\n// GET /{{resource_name}}/:id\nrouter.get('/:id', async (req, res) => {\n  // Implementation\n});\n\n// POST /{{resource_name}}\nrouter.post('/', async (req, res) => {\n  const data = {{resource_name}}Schema.parse(req.body);\n  // Implementation\n});\n\n// PUT /{{resource_name}}/:id\nrouter.put('/:id', async (req, res) => {\n  const data = {{resource_name}}Schema.parse(req.body);\n  // Implementation\n});\n\n// DELETE /{{resource_name}}/:id\nrouter.delete('/:id', async (req, res) => {\n  // Implementation\n});\n\nexport default router;"
    }
  ]
}
```

## Performance Optimization

### Template Caching
Templates are cached in memory for fast access:
- LRU cache with 50 template limit
- 5-minute TTL for cache entries
- Automatic cache invalidation on updates

### Lazy Loading
Templates are loaded on-demand:
- Metadata loaded first for discovery
- Full template loaded only when needed
- Streaming for large templates

### Parallel Processing
Multiple templates can be processed simultaneously:
- Concurrent file generation
- Parallel dependency installation
- Batch parameter validation

## Troubleshooting

### Common Issues

1. **Template Not Found**
```bash
# Update template cache
fluorite-mcp update-templates

# Verify template exists
fluorite-mcp list-templates | grep template-id
```

2. **Parameter Validation Failed**
```bash
# Check parameter requirements
fluorite-mcp info template-id

# Validate parameters
fluorite-mcp validate-params template-id --param key=value
```

3. **Merge Conflicts**
```bash
# Use abort strategy to prevent conflicts
fluorite-mcp apply template-id --strategy abort

# Or manually resolve conflicts
fluorite-mcp apply template-id --interactive
```

## Future Enhancements

- **Template Marketplace**: Community-contributed templates
- **Template Composition**: Combine multiple templates
- **AI-Generated Templates**: Create templates from descriptions
- **Template Analytics**: Usage statistics and recommendations
- **Version Management**: Template versioning and updates
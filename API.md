# Fluorite MCP API Documentation

## Overview

Fluorite MCP implements the Model Context Protocol (MCP) to provide library specifications, static analysis, and spike development tools to Claude Code CLI. This comprehensive API reference covers all available resources, tools, and integration patterns.

**Version**: 0.10.0  
**MCP Protocol**: 1.0.0  
**Node.js**: 18.0+

## Table of Contents

- [Quick Reference](#quick-reference)
- [Resources](#resources)
- [Tools](#tools)
- [Specification Format](#specification-format)
- [Static Analysis](#static-analysis)
- [Spike Templates](#spike-templates)
- [Integration Guide](#integration-guide)
- [Error Handling](#error-handling)
- [Performance and Limits](#performance-and-limits)

## Quick Reference

### Available Tools Summary

| Tool | Purpose | Parameters | Response Type |
|------|---------|------------|---------------|
| `list-specs` | List specifications | `filter?` | Specification list |
| `upsert-spec` | Add/update spec | `pkg`, `yaml` | Operation result |
| `catalog-stats` | Catalog statistics | None | Statistics object |
| `self-test` | Health check | None | Test results |
| `performance-test` | Performance metrics | None | Performance data |
| `server-metrics` | Server observability | None | Metrics object |
| `static-analysis` | Code analysis | `projectPath`, options | Analysis results |
| `quick-validate` | Code validation | `code`, `language` | Validation results |
| `realtime-validation` | File validation | `file`, options | Validation results |
| `get-validation-rules` | List rules | None | Available rules |
| `discover-spikes` | Find templates | `query?`, `limit?` | Template list |
| `auto-spike` | Smart template selection | `task` | Best match |
| `preview-spike` | Template preview | `id`, `params?` | Template details |
| `apply-spike` | Apply template | `id`, `params?` | Application plan |
| `validate-spike` | Validate application | `id`, `params?` | Validation results |
| `explain-spike` | Template details | `id` | Template info |

### Resource URI Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `spec://{library-id}` | Library specification | `spec://react-dnd-treeview` |
| `spec://{ecosystem-id}` | Ecosystem specification | `spec://web-development-comprehensive-ecosystem` |
| `spec://{framework}-{feature}` | Framework feature | `spec://nextjs-auth` |

## Resources

Resources provide access to library specifications stored in YAML format.

### Resource URI Format

```
spec://{library-identifier}
```

### Available Resources

| Resource | Description | Example URI |
|----------|-------------|-------------|
| Library Specs | Individual library specifications | `spec://react-dnd-treeview` |
| Ecosystem Specs | Comprehensive ecosystem specifications | `spec://spike-development-ecosystem` |
| Starter Templates | Opinionated starter configurations | `spec://vercel-next-starter` |
| SuperClaude Integration | Enhanced /fl: commands with Strike development | Enhanced via fluorite-mcp wrapper CLI |

### Fetching Resources

```typescript
// MCP Client Example
const resource = await client.getResource('spec://react-dnd-treeview');
```

Response format:
```json
{
  "uri": "spec://react-dnd-treeview",
  "name": "React DnD TreeView Specification",
  "mimeType": "application/x-yaml",
  "content": "name: React DnD TreeView\n..."
}
```

## Tools

Fluorite MCP provides several tools for specification management and static analysis.

### 1. list-specs

Lists all available specifications in the catalog.

**Parameters:**
```typescript
{
  filter?: string  // Optional filter pattern for package names
}
```

**Example:**
```json
{
  "filter": "react"
}
```

**Response:**
```json
{
  "specs": [
    {
      "id": "react-dnd-treeview",
      "name": "React DnD TreeView",
      "category": "ui-components"
    }
  ],
  "total": 87
}
```

### 2. upsert-spec

Creates or updates a library specification.

**Parameters:**
```typescript
{
  pkg: string      // Package identifier (max 255 chars)
  yaml: string     // YAML specification content (max 1MB)
}
```

**Example:**
```json
{
  "pkg": "my-library",
  "yaml": "name: My Library\nversion: 1.0.0\n..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Specification saved successfully",
  "id": "my-library"
}
```

### 3. catalog-stats

Displays catalog statistics for diagnostics.

**Parameters:** None

**Response:**
```json
{
  "totalSpecs": 87,
  "categories": {
    "ui-components": 15,
    "state-management": 8,
    "development-methodology": 2
  },
  "totalLines": 44000,
  "lastUpdated": "2025-08-15T10:00:00Z"
}
```

### 4. self-test

Runs MCP server self-diagnostic tests.

**Parameters:** None

**Response:**
```json
{
  "status": "healthy",
  "tests": {
    "catalog_loading": "passed",
    "yaml_parsing": "passed",
    "resource_access": "passed"
  },
  "duration": "45ms"
}
```

### 5. performance-test

Runs performance tests on the MCP server.

**Parameters:** None

**Response:**
```json
{
  "metrics": {
    "catalog_load_time": "23ms",
    "resource_fetch_avg": "1.2ms",
    "memory_usage": "34MB",
    "spec_count": 87
  },
  "status": "optimal"
}
```

### 6. server-metrics

Displays server observability metrics.

**Parameters:** None

**Response:**
```json
{
  "uptime": 3600,
  "requests_handled": 1523,
  "errors": 0,
  "memory": {
    "used": "34MB",
    "heap": "52MB"
  },
  "performance": {
    "avg_response_time": "2.3ms",
    "p95_response_time": "8.1ms"
  }
}
```

### 7. static-analysis

Performs comprehensive static analysis on code.

**Parameters:**
```typescript
{
  projectPath: string      // Path to project directory
  framework?: string       // Framework type (nextjs|vue|react)
  predictErrors?: boolean  // Enable error prediction
  analyzeDependencies?: boolean  // Analyze dependencies
}
```

**Example:**
```json
{
  "projectPath": "/path/to/project",
  "framework": "nextjs",
  "predictErrors": true,
  "analyzeDependencies": true
}
```

**Response:**
```json
{
  "summary": {
    "errors": 5,
    "warnings": 12,
    "info": 3
  },
  "issues": [
    {
      "severity": "error",
      "message": "Using client hook in Server Component",
      "file": "app/page.tsx",
      "line": 15,
      "confidence": 1.0,
      "fix": "Add 'use client' directive"
    }
  ],
  "predictions": [
    {
      "type": "HydrationError",
      "probability": 0.85,
      "description": "Date.now() will cause hydration mismatch"
    }
  ]
}
```

### 8. quick-validate

Validates code snippets without file system access.

**Parameters:**
```typescript
{
  code: string          // Code to validate
  language: string      // Language (ts|tsx|js|jsx|vue)
  framework?: string    // Framework context
  fileName?: string     // Optional file name for context
}
```

**Example:**
```json
{
  "code": "const Component = () => { useState() }",
  "language": "tsx",
  "framework": "react"
}
```

**Response:**
```json
{
  "valid": false,
  "issues": [
    {
      "message": "useState must be imported from React",
      "line": 1,
      "severity": "error"
    }
  ]
}
```

### 9. realtime-validation

Performs real-time validation on files with framework-specific rules.

**Parameters:**
```typescript
{
  file: string          // File path to validate
  content?: string      // File content (if not reading from disk)
  framework?: string    // Target framework
  watchMode?: boolean   // Enable continuous validation
}
```

**Example:**
```json
{
  "file": "./src/components/Button.tsx",
  "framework": "react"
}
```

**Response:**
```json
{
  "valid": true,
  "issues": [],
  "metrics": {
    "linesOfCode": 45,
    "complexity": 3,
    "maintainabilityIndex": 85
  }
}
```

### 10. get-validation-rules

Returns available validation rules for different frameworks.

**Parameters:** None

**Response:**
```json
{
  "rules": [
    {
      "id": "react-hooks-order",
      "name": "Hook Call Order",
      "framework": "react",
      "severity": "error",
      "description": "Hooks must be called in the same order"
    },
    {
      "id": "nextjs-client-server-boundary",
      "name": "Client/Server Boundary",
      "framework": "nextjs", 
      "severity": "error",
      "description": "Client hooks cannot be used in Server Components"
    }
  ],
  "frameworks": ["react", "nextjs", "vue"],
  "totalRules": 50
}
```

## Specification Format

### YAML Structure

Each specification follows this structure:

```yaml
name: Library Name              # Required
version: 1.0.0                  # Required
description: Brief description   # Required
category: category-name         # Required
subcategory: subcategory       # Optional
tags:                          # Optional
  - tag1
  - tag2
homepage: https://...          # Optional
repository: https://github.com/... # Optional
language: TypeScript           # Optional

# For simple libraries
features:                      # Optional
  - Feature 1
  - Feature 2

configuration:                 # Optional
  example: |
    Code configuration example

# For ecosystems
tools:                        # Required for ecosystems
  tool_name:
    name: Tool Name
    description: Tool description
    homepage: https://...
    repository: https://...
    language: TypeScript
    features:
      - Feature 1
    configuration: |
      Configuration example
    best_practices:
      - Practice 1
      - Practice 2

workflows:                    # Optional
  workflow_name:
    description: Workflow description
    steps:
      - Step 1
      - Step 2

templates:                    # Optional
  template_name:
    description: Template description
    code: |
      Template code
```

### Categories

Standard categories for specifications:

- `ui-components` - UI libraries and components
- `state-management` - State management solutions
- `development-methodology` - Development practices and workflows
- `testing` - Testing frameworks and tools
- `authentication` - Auth libraries
- `database` - Database and ORM tools
- `framework` - Web frameworks
- `infrastructure` - Infrastructure and DevOps tools
- `language-ecosystem` - Programming language ecosystems

## Static Analysis

Fluorite MCP provides comprehensive static analysis capabilities for modern web frameworks.

### Supported Frameworks

| Framework | Analysis Rules | Error Prediction | Performance Metrics |
|-----------|----------------|------------------|-------------------|
| **Next.js** | 20+ rules | ✅ | ✅ |
| **React** | 15+ rules | ✅ | ✅ |
| **Vue.js** | 10+ rules | ✅ | ✅ |
| **TypeScript** | 12+ rules | ✅ | ✅ |

### Analysis Categories

#### Next.js Specific

- **Server/Client Boundary**: Detect client hooks in Server Components
- **Hydration Issues**: Prevent SSR/client mismatches  
- **Route Configuration**: Validate route parameters and middleware
- **Image Optimization**: Check Next.js Image usage
- **API Route Patterns**: Validate API route implementations

#### React Specific

- **Hook Usage**: Validate hook call order and dependencies
- **Component Patterns**: Check component lifecycle and patterns
- **State Management**: Analyze state update patterns
- **Performance**: Detect unnecessary re-renders
- **Accessibility**: ARIA and semantic HTML validation

#### Vue.js Specific

- **Composition API**: Validate reactive patterns
- **Component Communication**: Props and emit patterns
- **Lifecycle Management**: Setup and cleanup validation
- **Template Syntax**: Template expression analysis
- **Performance**: Reactivity optimization

### Error Prediction Engine

The error prediction system uses pattern matching to identify potential runtime issues:

```json
{
  "predictions": [
    {
      "type": "HydrationError",
      "probability": 0.85,
      "description": "Date.now() will cause hydration mismatch",
      "file": "components/ServerTime.tsx",
      "line": 12,
      "suggestion": "Use useEffect to update client-side time"
    },
    {
      "type": "MemoryLeak",
      "probability": 0.72,
      "description": "Event listener not cleaned up",
      "file": "hooks/useWindowResize.ts",
      "line": 8,
      "suggestion": "Return cleanup function from useEffect"
    }
  ]
}
```

### Custom Rule Configuration

```typescript
// Configure analysis rules
const analysisConfig = {
  framework: 'nextjs',
  rules: {
    'nextjs-client-server-boundary': 'error',
    'react-hooks-dependencies': 'warning',
    'typescript-strict-mode': 'info'
  },
  ignorePatterns: [
    '**/*.test.ts',
    'node_modules/**'
  ],
  customRules: [
    {
      id: 'team-naming-convention',
      pattern: /^[A-Z][a-zA-Z]*Component$/,
      message: 'Components must end with "Component"'
    }
  ]
};
```

## Spike Templates

Spike templates provide rapid prototyping capabilities with pre-built scaffolds.

### Template Structure

Each spike template follows this JSON format:

```json
{
  "id": "template-id",
  "name": "Human Readable Name",
  "version": "1.0.0",
  "stack": ["technology1", "technology2"],
  "tags": ["category", "feature"],
  "description": "What this template provides",
  "params": [
    {
      "name": "project_name",
      "required": false,
      "default": "my-app",
      "description": "Name of the project"
    }
  ],
  "files": [
    {
      "path": "{{project_name}}/package.json",
      "template": "JSON or code template with {{variable}} substitution"
    }
  ],
  "patches": [
    {
      "path": "existing-file.js",
      "operation": "insert",
      "content": "Code to insert"
    }
  ]
}
```

### Available Template Categories

#### Web Frameworks (30+ templates)

- **Next.js**: SSR apps, API routes, middleware, authentication
- **React**: Components, hooks, contexts, testing
- **Vue**: Composition API, components, routing
- **Fastapi**: REST APIs, authentication, database integration

#### Testing & Quality (15+ templates)

- **Playwright**: E2E tests, accessibility, visual regression
- **Vitest**: Unit tests, component testing, mocking
- **Cypress**: Integration testing, custom commands

#### DevOps & CI/CD (10+ templates)

- **GitHub Actions**: CI pipelines, deployment, security scans
- **Docker**: Containerization, multi-stage builds
- **Deployment**: Vercel, Netlify, AWS configurations

### Template Parameters

Templates support dynamic parameter substitution:

```json
{
  "params": [
    { "name": "app_name", "default": "my-app" },
    { "name": "port", "default": "3000" },
    { "name": "database", "default": "sqlite" }
  ]
}
```

Usage:
```typescript
// Apply template with custom parameters
const result = await client.callTool('apply-spike', {
  id: 'nextjs-minimal',
  params: {
    app_name: 'my-next-app',
    port: '3001'
  }
});
```

### Template Discovery

Find templates using natural language queries:

```typescript
// Discover templates
const templates = await client.callTool('discover-spikes', {
  query: 'nextjs authentication',
  limit: 5
});

// Auto-select best template
const autoSelected = await client.callTool('auto-spike', {
  task: 'Create a Next.js app with JWT authentication'
});
```

### Spike Workflow

1. **Discovery**: Find relevant templates
2. **Preview**: Examine template contents
3. **Apply**: Generate files and patches
4. **Validate**: Check implementation
5. **Explain**: Understand template choices

## Integration Guide

### Using with Claude Code CLI

1. **Installation**
   ```bash
   npm i -g fluorite-mcp
   claude mcp add fluorite -- fluorite-mcp
   ```

2. **Basic Usage**
   When using Claude Code, specifications are automatically available:
   ```
   User: "Create a drag and drop tree component"
   Claude: [Accesses spec://react-dnd-treeview automatically]
   ```

### Programmatic Usage

```typescript
import { MCPClient } from '@modelcontextprotocol/sdk';

const client = new MCPClient({
  command: 'fluorite-mcp',
  args: []
});

// List available specs
const specs = await client.callTool('list-specs', {});

// Get a specific specification
const resource = await client.getResource('spec://react-dnd-treeview');

// Run static analysis
const analysis = await client.callTool('static-analysis', {
  projectPath: './my-project',
  framework: 'nextjs'
});
```

### Custom Integration

```typescript
// Custom MCP Server Extension
import { FluoriteMCP } from 'fluorite-mcp';

class CustomMCP extends FluoriteMCP {
  constructor() {
    super();
    // Add custom specifications
    this.addSpec('custom-lib', customYaml);
  }
  
  // Override methods as needed
  async handleTool(name: string, params: any) {
    // Custom tool handling
    return super.handleTool(name, params);
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "SPEC_NOT_FOUND",
    "message": "Specification 'unknown-lib' not found",
    "details": {
      "requested": "unknown-lib",
      "available": ["lib1", "lib2"]
    }
  }
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `SPEC_NOT_FOUND` | Requested specification doesn't exist | Check available specs with `list-specs` |
| `INVALID_YAML` | YAML parsing failed | Validate YAML syntax |
| `SIZE_LIMIT_EXCEEDED` | Specification too large (>1MB) | Reduce specification size |
| `INVALID_PARAMS` | Invalid tool parameters | Check parameter requirements |
| `ANALYSIS_FAILED` | Static analysis error | Check file paths and permissions |

### Handling Errors

```typescript
try {
  const result = await client.callTool('upsert-spec', {
    pkg: 'my-lib',
    yaml: invalidYaml
  });
} catch (error) {
  if (error.code === 'INVALID_YAML') {
    console.error('YAML syntax error:', error.details);
  }
}
```

## Rate Limits and Performance

### Performance Characteristics

- **Startup Time**: < 100ms
- **Resource Fetch**: ~1ms average
- **Static Analysis**: 1-10ms per file
- **Memory Usage**: ~34MB active
- **Max Spec Size**: 1MB per specification

### Optimization Tips

1. **Cache Resources**: Cache frequently used specifications
2. **Batch Operations**: Use `list-specs` with filters instead of multiple fetches
3. **Async Operations**: All tools support async/await
4. **Selective Analysis**: Use framework hints for faster static analysis

## Versioning

Fluorite MCP follows semantic versioning:

- **Major**: Breaking API changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, documentation updates

Check version:
```bash
fluorite-mcp --version
```

## Performance and Limits

### Performance Characteristics

| Operation | Typical Response Time | Memory Usage | Concurrency |
|-----------|---------------------|--------------|-------------|
| **Resource Fetch** | ~1ms | <1MB | 100+ concurrent |
| **Static Analysis** | 1-10ms/file | 2-8MB | 10 concurrent |
| **Spike Operations** | 5-50ms | <5MB | 20 concurrent |
| **Catalog Operations** | <5ms | <10MB | Unlimited |

### System Limits

#### File and Content Limits

- **Max Spec Size**: 1MB per specification
- **Max Project Size**: No hard limit (performance degrades >10k files)
- **Max Filename Length**: 255 characters
- **Supported File Types**: `.yaml`, `.yml`, `.json`, `.ts`, `.tsx`, `.js`, `.jsx`, `.vue`

#### Request Limits

- **Concurrent Requests**: 100 per second
- **Request Timeout**: 30 seconds
- **Max Response Size**: 10MB
- **Rate Limiting**: 1000 requests/minute per client

#### Memory Management

```typescript
// Memory usage by component
const memoryUsage = {
  catalogCache: "10-20MB",
  analysisEngine: "5-15MB", 
  spikeTemplates: "2-5MB",
  mcpProtocol: "1-3MB"
};

// Automatic cleanup triggers
const cleanupTriggers = {
  memoryThreshold: "100MB",
  cacheExpiry: "1 hour",
  inactivityTimeout: "30 minutes"
};
```

### Optimization Tips

#### Client-Side Optimization

```typescript
// Use connection pooling
const client = new MCPClient({
  keepAlive: true,
  maxConnections: 5
});

// Batch requests when possible
const [specs, stats, rules] = await Promise.all([
  client.callTool('list-specs', { filter: 'react' }),
  client.callTool('catalog-stats', {}),
  client.callTool('get-validation-rules', {})
]);

// Cache frequently accessed resources
const resourceCache = new Map();
const getResource = async (uri) => {
  if (!resourceCache.has(uri)) {
    resourceCache.set(uri, await client.getResource(uri));
  }
  return resourceCache.get(uri);
};
```

#### Server-Side Optimization

```bash
# Increase memory allocation for large projects
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable analysis caching
export FLUORITE_ENABLE_CACHE=true
export FLUORITE_CACHE_TTL=3600

# Optimize for specific frameworks
export FLUORITE_PRIMARY_FRAMEWORK=nextjs
```

### Monitoring and Observability

#### Health Checks

```typescript
// Basic health check
const health = await client.callTool('self-test', {});
console.log('Server health:', health.status);

// Performance metrics
const perf = await client.callTool('performance-test', {});
console.log('Average response time:', perf.metrics.avg_response_time);

// Server metrics
const metrics = await client.callTool('server-metrics', {});
console.log('Memory usage:', metrics.memory.used);
```

#### Custom Monitoring

```typescript
// Track request patterns
class MCPMonitor {
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0
  };
  
  async callTool(name: string, args: any) {
    const start = performance.now();
    try {
      const result = await this.client.callTool(name, args);
      this.updateMetrics(performance.now() - start, false);
      return result;
    } catch (error) {
      this.updateMetrics(performance.now() - start, true);
      throw error;
    }
  }
  
  private updateMetrics(duration: number, isError: boolean) {
    this.metrics.requestCount++;
    if (isError) this.metrics.errorCount++;
    
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + duration) / 2;
  }
}
```

### Scaling Considerations

#### Horizontal Scaling

```yaml
# Docker Compose example
services:
  fluorite-mcp-1:
    image: fluorite-mcp:latest
    environment:
      - CATALOG_DIR=/shared/catalog
    volumes:
      - catalog-data:/shared/catalog
      
  fluorite-mcp-2:
    image: fluorite-mcp:latest
    environment:
      - CATALOG_DIR=/shared/catalog
    volumes:
      - catalog-data:/shared/catalog
      
  load-balancer:
    image: nginx:alpine
    ports:
      - "3000:80"
    depends_on:
      - fluorite-mcp-1
      - fluorite-mcp-2

volumes:
  catalog-data:
```

#### Vertical Scaling

```bash
# Production deployment optimizations
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=8192"
export FLUORITE_WORKER_THREADS=8
export FLUORITE_ANALYSIS_CONCURRENCY=20
```

## Version Compatibility

### MCP Protocol Compatibility

| Fluorite MCP Version | MCP Protocol | Claude Code CLI | Node.js |
|---------------------|--------------|-----------------|---------|
| 0.8.x | 1.0.0 | Latest | 18.0+ |
| 0.7.x | 0.9.x | 0.5+ | 18.0+ |
| 0.6.x | 0.8.x | 0.4+ | 16.0+ |

### API Versioning

Fluorite MCP follows semantic versioning:
- **Major**: Breaking API changes, MCP protocol updates
- **Minor**: New tools, specifications, backward compatible  
- **Patch**: Bug fixes, specification updates, performance improvements

### Migration Guide

#### Upgrading from 0.7.x to 0.8.x

```bash
# Update package
npm update -g fluorite-mcp

# Check for breaking changes
fluorite-mcp --migration-check

# Update Claude Code CLI configuration if needed
claude mcp remove fluorite
claude mcp add fluorite -- fluorite-mcp
```

**Breaking Changes**:
- Tool response format updated for spike operations
- Static analysis includes new error prediction format
- Some specification categories have been reorganized

**Migration**:
```typescript
// Old format (0.7.x)
const result = await client.callTool('analyze-project', { path: './src' });

// New format (0.8.x)  
const result = await client.callTool('static-analysis', {
  projectPath: './src',
  framework: 'nextjs'
});
```

## Support

### Documentation

- **[Getting Started Guide](./docs/getting-started.md)** - Quick setup and first steps
- **[Installation Guide](./docs/installation.md)** - Detailed installation instructions
- **[Command Reference](./docs/commands.md)** - Complete command documentation
- **[Developer Guide](./docs/developer.md)** - Advanced development and contribution

### Community Support

- **[GitHub Issues](https://github.com/kotsutsumi/fluorite-mcp/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions)** - Community help and discussions
- **[Official Documentation](https://kotsutsumi.github.io/fluorite-mcp)** - Complete documentation site

### Commercial Support

For enterprise deployments and custom integrations:
- Performance optimization consulting
- Custom specification development
- Priority support and SLAs
- Training and onboarding

Contact: [Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions) for commercial inquiries.

---

*API Documentation v0.9.7 - Last updated: 2025-08-15*
# Fluorite MCP API Documentation

## Overview

Fluorite MCP implements the Model Context Protocol (MCP) to provide library specifications and development tools to Claude Code CLI. This document describes the available resources, tools, and their usage.

## Table of Contents

- [Resources](#resources)
- [Tools](#tools)
- [Specification Format](#specification-format)
- [Integration Guide](#integration-guide)
- [Error Handling](#error-handling)

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
  "total": 82
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
  "totalSpecs": 82,
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
    "spec_count": 82
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

## Support

- **Issues**: [GitHub Issues](https://github.com/kotsutsumi/fluorite-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions)
- **Documentation**: [Official Docs](https://kotsutsumi.github.io/fluorite-mcp)

---

*Last updated: 2025-08-15*
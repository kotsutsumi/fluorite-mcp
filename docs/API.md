# API Reference

Complete API reference for Fluorite MCP with detailed endpoints, parameters, and examples.

## 📖 Table of Contents

- [MCP Protocol Overview](#mcp-protocol-overview)
- [Available Tools](#available-tools)
- [Tool Parameters](#tool-parameters)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

---

## MCP Protocol Overview

Fluorite MCP implements the Model Context Protocol (MCP) to provide seamless integration with Claude Code CLI. All interactions follow the standard MCP patterns for tools and resources.

### Server Information

```json
{
  "name": "fluorite-mcp",
  "version": "0.18.5",
  "protocol_version": "2024-11-05",
  "capabilities": {
    "tools": true,
    "resources": true,
    "logging": true
  }
}
```

### Connection

```bash
# Standard connection via Claude Code CLI
claude mcp add fluorite-mcp -- fluorite-mcp

# Direct connection for development
fluorite-mcp --stdio
```

---

## Available Tools

Fluorite MCP provides 15 specialized tools across 4 main categories:

### Specification Management (3 tools)

| Tool | Purpose | Parameters |
|------|---------|------------|
| `list-specs` | List library specifications | `filter?: string` |
| `upsert-spec` | Create/update specifications | `pkg: string, yaml: string` |
| `catalog-stats` | Get catalog statistics | None |

### Static Analysis (4 tools)

| Tool | Purpose | Parameters |
|------|---------|------------|
| `static-analysis` | Comprehensive code analysis | Multiple options |
| `quick-validate` | Fast code validation | `code: string, language?: string` |
| `realtime-validation` | File validation | `file: string, framework?: string` |
| `get-validation-rules` | List available rules | None |

### Spike Development (6 tools)

| Tool | Purpose | Parameters |
|------|---------|------------|
| `discover-spikes` | Find spike templates | `query?: string, limit?: number` |
| `auto-spike` | AI-powered spike selection | `task: string, constraints?: object` |
| `preview-spike` | Preview template | `id: string, params?: object` |
| `apply-spike` | Apply template | `id: string, params?: object` |
| `validate-spike` | Validate applied spike | `id: string, params?: object` |
| `explain-spike` | Get spike documentation | `id: string` |

### Diagnostics (2 tools)

| Tool | Purpose | Parameters |
|------|---------|------------|
| `self-test` | Server diagnostics | None |
| `performance-test` | Performance metrics | None |

---

## Tool Parameters

### `static-analysis`

Comprehensive static analysis with framework-specific rules.

```typescript
interface StaticAnalysisParams {
  projectPath: string;                    // Project root directory
  framework?: string;                     // Target framework (auto-detected if omitted)
  targetFiles?: string[];                 // Specific files to analyze
  strictMode?: boolean;                   // Enable strict validation
  predictErrors?: boolean;                // Enable error prediction
  analyzeDependencies?: boolean;          // Analyze dependencies
  autoFix?: boolean;                      // Generate auto-fix suggestions
  maxIssues?: number;                     // Limit number of reported issues
  enabledRules?: string[];               // Specific rules to enable
  disabledRules?: string[];              // Specific rules to disable
}
```

### `auto-spike`

AI-powered spike template selection based on natural language tasks.

```typescript
interface AutoSpikeParams {
  task: string;                          // Natural language task description
  constraints?: {                        // Optional constraints
    framework?: string;                  // Preferred framework
    complexity?: 'simple' | 'moderate' | 'complex';
    timeLimit?: number;                  // Max estimated time in minutes
    dependencies?: string[];             // Required dependencies
    [key: string]: any;                  // Additional constraints
  };
}
```

### `apply-spike`

Apply a spike template with parameters.

```typescript
interface ApplySpikeParams {
  id: string;                           // Spike template ID
  params?: Record<string, any>;         // Template parameters
  strategy?: 'overwrite' | 'three_way_merge' | 'abort'; // Conflict resolution
}
```

---

## Response Formats

### Success Response

All successful tool calls return a standardized format:

```typescript
interface ToolResponse {
  content: Array<{
    type: 'text' | 'resource';
    text?: string;
    resource?: ResourceContent;
  }>;
  isError?: false;
  metadata?: {
    operationId?: string;
    timestamp?: string;
    performance?: {
      durationMs: number;
      memoryUsageMB: number;
    };
    [key: string]: any;
  };
}
```

### Error Response

Error responses include detailed error information:

```typescript
interface ErrorResponse {
  content: Array<{
    type: 'text';
    text: string;  // Error message
  }>;
  isError: true;
  metadata?: {
    errorCode?: string;
    errorType?: string;
    stack?: string;
    suggestions?: string[];
  };
}
```

---

## Error Handling

### Common Error Types

| Error Type | Description | Resolution |
|------------|-------------|------------|
| `INVALID_PARAMS` | Invalid or missing parameters | Check parameter format and requirements |
| `FILE_NOT_FOUND` | Target file/directory not found | Verify file paths and permissions |
| `ANALYSIS_FAILED` | Static analysis error | Check project structure and dependencies |
| `SPIKE_NOT_FOUND` | Spike template not found | Use `discover-spikes` to find available templates |
| `VALIDATION_ERROR` | Code validation failed | Review validation errors and fix code issues |
| `DEPENDENCY_ERROR` | Missing dependencies | Install required dependencies |
| `PERMISSION_ERROR` | File system permission denied | Check file/directory permissions |

### Error Recovery

```typescript
// Example error handling with retry logic
async function callToolWithRetry(toolName: string, params: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.callTool(toolName, params);
      
      if (result.isError) {
        console.error(`Tool error (attempt ${attempt}):`, result.content[0].text);
        
        // Check if error is recoverable
        if (isRecoverableError(result.metadata?.errorType)) {
          await delay(1000 * attempt); // Exponential backoff
          continue;
        } else {
          throw new Error(result.content[0].text);
        }
      }
      
      return result;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await delay(1000 * attempt);
    }
  }
}

function isRecoverableError(errorType?: string): boolean {
  const recoverableErrors = ['TIMEOUT', 'RATE_LIMIT', 'TEMPORARY_FAILURE'];
  return recoverableErrors.includes(errorType || '');
}
```

---

## Usage Examples

### Basic Specification Management

```typescript
// List all available specifications
const specs = await client.callTool('list-specs', {});
console.log(`Found ${specs.metadata.totalCount} specifications`);

// Filter specifications by technology
const reactSpecs = await client.callTool('list-specs', { filter: 'react' });

// Get catalog statistics
const stats = await client.callTool('catalog-stats', {});
console.log(`Total specs: ${stats.metadata.totalSpecs}`);
```

### Static Analysis Workflow

```typescript
// Comprehensive project analysis
const analysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/project',
  framework: 'nextjs',
  predictErrors: true,
  analyzeDependencies: true,
  maxIssues: 50
});

// Quick code validation
const validation = await client.callTool('quick-validate', {
  code: `
    function MyComponent() {
      return <div>Hello World</div>;
    }
  `,
  language: 'tsx'
});

// Real-time file validation
const fileValidation = await client.callTool('realtime-validation', {
  file: '/path/to/component.tsx',
  framework: 'react'
});
```

### Spike Development Workflow

```typescript
// Discover relevant spike templates
const spikes = await client.callTool('discover-spikes', {
  query: 'react typescript component',
  limit: 10
});

// Use AI to select optimal spike
const autoSpike = await client.callTool('auto-spike', {
  task: 'Create a reusable button component with TypeScript support',
  constraints: {
    framework: 'react',
    complexity: 'simple',
    timeLimit: 30
  }
});

// Preview spike before applying
const preview = await client.callTool('preview-spike', {
  id: autoSpike.metadata.selectedSpikeId,
  params: {
    componentName: 'Button',
    includeStorybook: true
  }
});

// Apply the spike template
const applied = await client.callTool('apply-spike', {
  id: autoSpike.metadata.selectedSpikeId,
  params: {
    componentName: 'Button',
    includeStorybook: true,
    includeTests: true
  }
});

// Validate the applied spike
const validation = await client.callTool('validate-spike', {
  id: autoSpike.metadata.selectedSpikeId,
  params: {
    componentName: 'Button'
  }
});
```

### Advanced Analysis with Custom Rules

```typescript
// Get available validation rules
const rules = await client.callTool('get-validation-rules', {});

// Run analysis with specific rules
const customAnalysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/project',
  enabledRules: [
    'react-hooks-exhaustive-deps',
    'typescript-strict-mode',
    'accessibility-aria-labels'
  ],
  disabledRules: [
    'no-console'
  ],
  autoFix: true
});
```

### Error Handling Example

```typescript
try {
  const result = await client.callTool('static-analysis', {
    projectPath: '/nonexistent/path'
  });
} catch (error) {
  if (error.isError && error.metadata?.errorType === 'FILE_NOT_FOUND') {
    console.log('Project path not found. Please check the path and try again.');
    
    // Suggest alternative paths
    if (error.metadata?.suggestions) {
      console.log('Suggested paths:', error.metadata.suggestions);
    }
  } else {
    console.error('Unexpected error:', error.content[0].text);
  }
}
```

### Performance Monitoring

```typescript
// Run performance diagnostics
const perfTest = await client.callTool('performance-test', {});
console.log(`Analysis performance: ${perfTest.metadata.analysisTimeMs}ms`);

// Server health check
const healthCheck = await client.callTool('self-test', {});
if (healthCheck.metadata.healthy) {
  console.log('✅ Server is healthy');
} else {
  console.warn('⚠️ Server issues detected:', healthCheck.metadata.issues);
}
```

### Batch Operations

```typescript
// Analyze multiple files in parallel
const files = [
  '/path/to/component1.tsx',
  '/path/to/component2.tsx',
  '/path/to/component3.tsx'
];

const validations = await Promise.all(
  files.map(file => 
    client.callTool('realtime-validation', { file })
  )
);

// Process results
validations.forEach((validation, index) => {
  if (validation.isError) {
    console.error(`Validation failed for ${files[index]}:`, validation.content[0].text);
  } else {
    console.log(`✅ ${files[index]} validated successfully`);
  }
});
```

---

## Rate Limiting and Performance

### Rate Limits

| Operation Type | Limit | Window |
|----------------|-------|--------|
| Static Analysis | 10 requests | per minute |
| Spike Operations | 20 requests | per minute |
| Specification Queries | 100 requests | per minute |
| Diagnostics | 5 requests | per minute |

### Performance Tips

1. **Use Batch Operations**: Group related operations when possible
2. **Cache Results**: Cache analysis results for unchanged files
3. **Optimize Filters**: Use specific filters to reduce response size
4. **Monitor Performance**: Use diagnostic tools to track performance
5. **Handle Errors Gracefully**: Implement proper error handling and retries

### Response Time Guidelines

| Operation | Typical Response Time | Max Response Time |
|-----------|----------------------|-------------------|
| `list-specs` | 50-100ms | 500ms |
| `static-analysis` | 500ms-5s | 30s |
| `discover-spikes` | 100-300ms | 2s |
| `apply-spike` | 200ms-2s | 10s |
| Diagnostics | 50-200ms | 1s |

---

## SDK Integration

### Node.js SDK Example

```typescript
import { MCPClient } from '@modelcontextprotocol/sdk';

class FluoriteMCPClient {
  private client: MCPClient;

  constructor() {
    this.client = new MCPClient({
      command: 'fluorite-mcp',
      args: ['--stdio']
    });
  }

  async initialize(): Promise<void> {
    await this.client.connect();
  }

  async analyzeProject(projectPath: string, options = {}): Promise<any> {
    return await this.client.callTool('static-analysis', {
      projectPath,
      ...options
    });
  }

  async findSpikes(query: string): Promise<any> {
    return await this.client.callTool('discover-spikes', { query });
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}

// Usage
const fluorite = new FluoriteMCPClient();
await fluorite.initialize();

const analysis = await fluorite.analyzeProject('./my-project');
const spikes = await fluorite.findSpikes('react component');

await fluorite.disconnect();
```

---

*For detailed function documentation, see [Function Reference](./function-reference.md).*

*For integration patterns, see [Integration Guide](./integration-guide.md).*
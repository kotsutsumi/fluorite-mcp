# Fluorite Command Mapping Specification

## Command Mapping Architecture

### Base Mapping Structure
```typescript
interface FluoriteCommand {
  pattern: RegExp;                    // /fl:command pattern
  superclaudeCommand: string;         // Corresponding /sc:command
  enhancers: CommandEnhancer[];       // Pre/post processors
  spikeIntegration: SpikeConfig;      // Spike template integration
  serenaEnabled: boolean;             // Natural language processing
  tokenOptimization: boolean;         // Cache and compress
  customLogic?: Function;             // Command-specific logic
}
```

## Core Command Mappings

### 1. Git Operations

#### /fl:git
```typescript
{
  pattern: /^\/fl:git\s+(.+)$/,
  superclaudeCommand: '/sc:git',
  enhancers: [
    {
      type: 'pre',
      name: 'commit-message-enhancer',
      action: (args) => {
        // Add emoji and conventional commit format
        // Generate detailed commit body
        // Add issue references
      }
    },
    {
      type: 'post',
      name: 'git-hooks-validator',
      action: (result) => {
        // Validate commit hooks
        // Run pre-push checks
      }
    }
  ],
  spikeIntegration: {
    templates: ['git-workflow', 'conventional-commits'],
    autoApply: true
  },
  serenaEnabled: true,
  tokenOptimization: true
}
```

### 2. Analysis Commands

#### /fl:analyze
```typescript
{
  pattern: /^\/fl:analyze\s*(.*)$/,
  superclaudeCommand: '/sc:analyze',
  enhancers: [
    {
      type: 'pre',
      name: 'architecture-scanner',
      action: async (args) => {
        // Auto-detect project structure
        // Identify frameworks and patterns
        // Generate analysis context
      }
    },
    {
      type: 'post',
      name: 'report-generator',
      action: async (result) => {
        // Generate visual reports
        // Create actionable recommendations
        // Save analysis cache
      }
    }
  ],
  spikeIntegration: {
    templates: ['code-analysis', 'architecture-review'],
    contextAware: true
  },
  serenaEnabled: true,
  customLogic: async (args) => {
    // Use fluorite's static analysis tools
    // Integrate with dependency analyzer
    // Leverage error predictor
  }
}
```

### 3. Implementation Commands

#### /fl:implement
```typescript
{
  pattern: /^\/fl:implement\s+(.+)$/,
  superclaudeCommand: '/sc:implement',
  enhancers: [
    {
      type: 'pre',
      name: 'spike-selector',
      action: async (args) => {
        // Parse natural language requirement
        // Match to spike templates
        // Prepare implementation context
      }
    },
    {
      type: 'during',
      name: 'code-generator',
      action: async (context) => {
        // Apply spike templates
        // Generate boilerplate
        // Setup project structure
      }
    },
    {
      type: 'post',
      name: 'dependency-installer',
      action: async (result) => {
        // Install required packages
        // Setup configuration files
        // Run initialization scripts
      }
    }
  ],
  spikeIntegration: {
    discovery: true,
    autoSelect: true,
    multiTemplate: true
  },
  serenaEnabled: true,
  tokenOptimization: true,
  customLogic: async (args) => {
    // Natural language to spike mapping
    // Example: "create REST API with auth" ->
    // Spikes: ['express-minimal', 'jwt-auth', 'rest-api-crud']
  }
}
```

### 4. Build Commands

#### /fl:build
```typescript
{
  pattern: /^\/fl:build\s*(.*)$/,
  superclaudeCommand: '/sc:build',
  enhancers: [
    {
      type: 'pre',
      name: 'build-optimizer',
      action: async (args) => {
        // Detect build system
        // Optimize configuration
        // Setup caching
      }
    },
    {
      type: 'post',
      name: 'artifact-manager',
      action: async (result) => {
        // Store build artifacts
        // Generate build reports
        // Update version info
      }
    }
  ],
  spikeIntegration: {
    templates: ['build-configs', 'ci-cd-pipelines']
  },
  tokenOptimization: true
}
```

### 5. Testing Commands

#### /fl:test
```typescript
{
  pattern: /^\/fl:test\s*(.*)$/,
  superclaudeCommand: '/sc:test',
  enhancers: [
    {
      type: 'pre',
      name: 'test-generator',
      action: async (args) => {
        // Generate test cases from spikes
        // Setup test environment
        // Configure test runners
      }
    },
    {
      type: 'post',
      name: 'coverage-reporter',
      action: async (result) => {
        // Generate coverage reports
        // Identify untested code
        // Suggest additional tests
      }
    }
  ],
  spikeIntegration: {
    templates: ['jest-setup', 'playwright-e2e', 'vitest-config']
  },
  serenaEnabled: true
}
```

### 6. Documentation Commands

#### /fl:document
```typescript
{
  pattern: /^\/fl:document\s*(.*)$/,
  superclaudeCommand: '/sc:document',
  enhancers: [
    {
      type: 'pre',
      name: 'doc-analyzer',
      action: async (args) => {
        // Analyze code for documentation
        // Extract API signatures
        // Generate examples
      }
    },
    {
      type: 'post',
      name: 'doc-formatter',
      action: async (result) => {
        // Format for different outputs
        // Generate API docs
        // Create README sections
      }
    }
  ],
  spikeIntegration: {
    templates: ['readme-template', 'api-docs', 'jsdoc-config']
  },
  serenaEnabled: true,
  tokenOptimization: true
}
```

### 7. Improvement Commands

#### /fl:improve
```typescript
{
  pattern: /^\/fl:improve\s*(.*)$/,
  superclaudeCommand: '/sc:improve',
  enhancers: [
    {
      type: 'pre',
      name: 'improvement-analyzer',
      action: async (args) => {
        // Analyze current code quality
        // Identify improvement areas
        // Prioritize changes
      }
    },
    {
      type: 'during',
      name: 'refactoring-engine',
      action: async (context) => {
        // Apply best practices
        // Refactor code patterns
        // Optimize performance
      }
    }
  ],
  spikeIntegration: {
    templates: ['refactoring-patterns', 'performance-optimizations']
  },
  customLogic: async (args) => {
    // Use fluorite's static analyzer
    // Apply error predictor
    // Suggest improvements
  }
}
```

## Special Fluorite Commands

### /fl:spike
```typescript
{
  pattern: /^\/fl:spike\s+(\w+)\s*(.*)$/,
  subcommands: {
    'discover': async (query) => {
      // Search spike templates
      // Return ranked results
    },
    'apply': async (templateId, params) => {
      // Apply spike template
      // Generate code
    },
    'create': async (config) => {
      // Create new spike template
      // Validate and save
    },
    'list': async (filter) => {
      // List available spikes
      // Show categories
    }
  },
  serenaEnabled: true
}
```

### /fl:setup
```typescript
{
  pattern: /^\/fl:setup\s*(.*)$/,
  action: async (args) => {
    // Check Claude CLI installation
    // Install MCP server
    // Configure ~/.claude
    // Setup command aliases
    // Initialize spike templates
    // Verify installation
  },
  steps: [
    'checkClaudeCLI',
    'installMCPServer',
    'configureAliases',
    'downloadSpikes',
    'setupSerena',
    'verifySetup'
  ]
}
```

### /fl:config
```typescript
{
  pattern: /^\/fl:config\s+(\w+)\s*(.*)$/,
  subcommands: {
    'set': async (key, value) => {
      // Set configuration value
    },
    'get': async (key) => {
      // Get configuration value
    },
    'list': async () => {
      // List all configurations
    },
    'reset': async () => {
      // Reset to defaults
    }
  }
}
```

## Natural Language Processing

### Serena Integration Examples
```typescript
// Natural language to command mapping
const nlpMappings = {
  "create a REST API with authentication": {
    command: "/fl:implement",
    spikes: ["express-rest-api", "jwt-auth"],
    flags: ["--typescript", "--postgres"]
  },
  "analyze the architecture": {
    command: "/fl:analyze",
    flags: ["--focus", "architecture", "--depth", "deep"]
  },
  "setup testing": {
    command: "/fl:implement",
    spikes: ["jest-setup", "playwright-e2e"],
    followUp: "/fl:test"
  },
  "optimize performance": {
    command: "/fl:improve",
    flags: ["--focus", "performance"],
    analysis: "/fl:analyze --focus performance"
  }
};
```

## Token Optimization Strategies

### Caching System
```typescript
interface CacheStrategy {
  key: string;           // Cache key generation
  ttl: number;          // Time to live
  compression: boolean;  // Enable compression
  shared: boolean;      // Share across commands
}

const cacheStrategies = {
  '/fl:analyze': {
    key: (args) => `analyze:${hashArgs(args)}`,
    ttl: 3600,  // 1 hour
    compression: true,
    shared: true
  },
  '/fl:spike': {
    key: (template) => `spike:${template}`,
    ttl: 86400, // 24 hours
    compression: false,
    shared: true
  }
};
```

### Compression Techniques
```typescript
const compressionConfig = {
  enabled: true,
  algorithm: 'gzip',
  level: 6,
  threshold: 1024, // Compress if > 1KB
  excludePatterns: [/\.min\./, /\.gz$/]
};
```

## Command Chaining

### Workflow Examples
```typescript
// Development workflow
const workflows = {
  'full-stack-app': [
    '/fl:spike discover "nextjs typescript"',
    '/fl:spike apply nextjs-typescript',
    '/fl:implement "authentication system"',
    '/fl:implement "database models"',
    '/fl:test --generate',
    '/fl:document --api',
    '/fl:git commit,push'
  ],
  'api-development': [
    '/fl:spike apply fastapi-minimal',
    '/fl:implement "CRUD endpoints"',
    '/fl:implement "authentication"',
    '/fl:test --api',
    '/fl:document --openapi',
    '/fl:build --docker'
  ]
};
```

## Error Handling

### Command Error Recovery
```typescript
interface ErrorHandler {
  pattern: RegExp;
  recovery: Function;
  fallback: string;
}

const errorHandlers = [
  {
    pattern: /spike not found/i,
    recovery: async (error, args) => {
      // Suggest similar spikes
      // Offer to create new spike
    },
    fallback: '/fl:spike discover'
  },
  {
    pattern: /command failed/i,
    recovery: async (error, args) => {
      // Retry with different parameters
      // Fall back to SuperClaude
    },
    fallback: '/sc:' // Direct SuperClaude
  }
];
```
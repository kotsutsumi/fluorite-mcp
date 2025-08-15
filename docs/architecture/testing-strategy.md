# Fluorite-MCP Testing Strategy

## Testing Architecture

### Test Pyramid
```
         E2E Tests (10%)
        /            \
    Integration (30%)  \
   /                    \
  Unit Tests (60%)      /
 /_____________________/
```

## Test Categories

### 1. Unit Tests (60% Coverage)

#### CLI Components
```typescript
// src/cli/__tests__/parser.test.ts
describe('CommandParser', () => {
  describe('parseCommand', () => {
    it('should parse /fl:git commands correctly', () => {
      const result = parser.parse('/fl:git commit,push');
      expect(result).toEqual({
        command: 'git',
        args: ['commit', 'push'],
        flags: {},
        original: '/fl:git commit,push'
      });
    });
    
    it('should parse flags correctly', () => {
      const result = parser.parse('/fl:analyze --focus architecture --depth deep');
      expect(result.flags).toEqual({
        focus: 'architecture',
        depth: 'deep'
      });
    });
    
    it('should handle natural language inputs', () => {
      const result = parser.parse('/fl:implement "create REST API with auth"');
      expect(result.naturalLanguage).toBe(true);
      expect(result.query).toBe('create REST API with auth');
    });
  });
});
```

#### Spike Template System
```typescript
// src/cli/__tests__/spike-manager.test.ts
describe('SpikeManager', () => {
  describe('discoverSpikes', () => {
    it('should find relevant spike templates', async () => {
      const spikes = await manager.discover('nextjs typescript');
      expect(spikes).toContainEqual(
        expect.objectContaining({
          id: 'nextjs-typescript',
          score: expect.any(Number)
        })
      );
    });
    
    it('should rank spikes by relevance', async () => {
      const spikes = await manager.discover('authentication');
      expect(spikes[0].score).toBeGreaterThan(spikes[1].score);
    });
  });
  
  describe('applySpike', () => {
    it('should apply spike template with parameters', async () => {
      const result = await manager.apply('nextjs-minimal', {
        app_name: 'test-app',
        port: 3001
      });
      expect(result.files).toHaveLength(3);
      expect(result.files[0].content).toContain('test-app');
    });
  });
});
```

#### Command Mapping
```typescript
// src/cli/__tests__/command-mapper.test.ts
describe('CommandMapper', () => {
  it('should map fluorite to superclaude commands', () => {
    const mapped = mapper.map('/fl:git commit,push');
    expect(mapped.superclaude).toBe('/sc:git commit,push');
    expect(mapped.enhancers).toContain('commit-message-enhancer');
  });
  
  it('should apply spike integration', () => {
    const mapped = mapper.map('/fl:implement --spike nextjs-api');
    expect(mapped.spikes).toContain('nextjs-api-edge');
  });
});
```

### 2. Integration Tests (30% Coverage)

#### MCP Server Integration
```typescript
// src/__tests__/integration/mcp-server.test.ts
describe('MCP Server Integration', () => {
  let server: McpServer;
  
  beforeAll(async () => {
    server = await startMCPServer();
  });
  
  it('should register fluorite tools', async () => {
    const tools = await server.listTools();
    expect(tools).toContainEqual(
      expect.objectContaining({
        name: 'spike-discover'
      })
    );
  });
  
  it('should handle spike discovery requests', async () => {
    const result = await server.callTool('spike-discover', {
      query: 'nextjs'
    });
    expect(result.content).toBeDefined();
    expect(result.content[0].text).toContain('nextjs');
  });
});
```

#### Claude CLI Integration
```typescript
// src/__tests__/integration/claude-cli.test.ts
describe('Claude CLI Integration', () => {
  it('should setup fluorite in Claude config', async () => {
    await setup.run();
    
    const config = await readClaudeConfig();
    expect(config.servers).toContain('fluorite');
    
    const commands = await readClaudeCommands();
    expect(commands).toContain('/fl:');
  });
  
  it('should execute commands through Claude', async () => {
    const result = await executeClaudeCommand('/fl:spike list');
    expect(result.success).toBe(true);
  });
});
```

#### Serena MCP Integration
```typescript
// src/__tests__/integration/serena.test.ts
describe('Serena MCP Integration', () => {
  it('should enhance natural language commands', async () => {
    const enhanced = await serena.enhance('create a REST API');
    expect(enhanced.spikes).toContain('express-rest-api');
    expect(enhanced.command).toBe('/fl:implement');
  });
  
  it('should fallback gracefully', async () => {
    // Simulate Serena unavailable
    serena.disconnect();
    const result = await execute('/fl:implement "create API"');
    expect(result.success).toBe(true);
    expect(result.fallback).toBe(true);
  });
});
```

### 3. End-to-End Tests (10% Coverage)

#### Complete Workflows
```typescript
// src/__tests__/e2e/workflows.test.ts
describe('E2E Workflows', () => {
  it('should complete full development cycle', async () => {
    // Setup
    await execute('fluorite-mcp setup');
    
    // Discover spikes
    const discovery = await execute('/fl:spike discover "nextjs app"');
    expect(discovery).toContain('nextjs-minimal');
    
    // Apply spike
    await execute('/fl:spike apply nextjs-minimal');
    expect(fs.existsSync('next-app/package.json')).toBe(true);
    
    // Implement feature
    await execute('/fl:implement "add authentication"');
    expect(fs.existsSync('next-app/auth')).toBe(true);
    
    // Test
    await execute('/fl:test');
    
    // Document
    await execute('/fl:document');
    expect(fs.existsSync('README.md')).toBe(true);
    
    // Commit
    await execute('/fl:git commit,push');
  });
  
  it('should handle API development workflow', async () => {
    await execute('/fl:spike apply fastapi-minimal');
    await execute('/fl:implement "CRUD endpoints for users"');
    await execute('/fl:test --api');
    await execute('/fl:document --openapi');
    await execute('/fl:build --docker');
  });
});
```

#### Error Recovery
```typescript
// src/__tests__/e2e/error-recovery.test.ts
describe('Error Recovery', () => {
  it('should recover from spike not found', async () => {
    const result = await execute('/fl:spike apply non-existent');
    expect(result.error).toBeDefined();
    expect(result.suggestions).toContain('Did you mean');
  });
  
  it('should handle command failures gracefully', async () => {
    const result = await execute('/fl:invalid-command');
    expect(result.fallback).toBe('/sc:invalid-command');
  });
});
```

## Testing Infrastructure

### Test Environment Setup
```typescript
// src/test/setup.ts
export async function setupTestEnvironment() {
  // Create temp directories
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fluorite-test-'));
  
  // Mock Claude CLI
  const mockClaude = new MockClaudeCLI(tempDir);
  
  // Setup test spikes
  await copyTestSpikes(tempDir);
  
  // Start test MCP server
  const server = await startTestMCPServer();
  
  return { tempDir, mockClaude, server };
}
```

### Mock Systems
```typescript
// src/test/mocks/claude-cli.mock.ts
export class MockClaudeCLI {
  constructor(private tempDir: string) {
    this.configPath = path.join(tempDir, '.claude');
  }
  
  async executeCommand(command: string): Promise<Result> {
    // Simulate Claude CLI execution
    return this.commandHandler.handle(command);
  }
  
  async addMCPServer(name: string, command: string): Promise<void> {
    // Simulate MCP server registration
  }
}
```

### Test Data Fixtures
```typescript
// src/test/fixtures/spikes.ts
export const testSpikes = [
  {
    id: 'test-minimal',
    name: 'Test Minimal Template',
    files: [
      {
        path: 'index.js',
        template: 'console.log("test");'
      }
    ]
  },
  // More test spikes...
];
```

## Performance Testing

### Benchmark Suite
```typescript
// src/__tests__/performance/benchmarks.test.ts
describe('Performance Benchmarks', () => {
  it('should parse commands in < 10ms', async () => {
    const start = performance.now();
    parser.parse('/fl:git commit,push');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });
  
  it('should apply spikes in < 2s', async () => {
    const start = performance.now();
    await spikeManager.apply('nextjs-minimal');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
  
  it('should complete setup in < 60s', async () => {
    const start = performance.now();
    await setup.run();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(60000);
  });
});
```

### Load Testing
```typescript
// src/__tests__/performance/load.test.ts
describe('Load Testing', () => {
  it('should handle concurrent spike discoveries', async () => {
    const promises = Array(100).fill(0).map(() => 
      spikeManager.discover('nextjs')
    );
    
    const results = await Promise.all(promises);
    expect(results.every(r => r.length > 0)).toBe(true);
  });
  
  it('should manage cache efficiently', async () => {
    // Fill cache
    for (let i = 0; i < 1000; i++) {
      await cache.set(`key-${i}`, `value-${i}`);
    }
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    expect(memUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // < 100MB
  });
});
```

## Test Automation

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit
      
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:e2e
      
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:performance
```

### Test Scripts
```json
// package.json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run src/**/*.test.ts",
    "test:integration": "vitest run src/**/*.integration.test.ts",
    "test:e2e": "vitest run src/**/*.e2e.test.ts",
    "test:performance": "vitest run src/**/*.perf.test.ts",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --reporter=verbose --bail"
  }
}
```

## Quality Gates

### Coverage Requirements
- Overall: > 80%
- Unit tests: > 90%
- Integration tests: > 70%
- Critical paths: 100%

### Performance Thresholds
- Command parsing: < 10ms
- Spike application: < 2s
- Setup completion: < 60s
- Memory usage: < 100MB

### Code Quality
- ESLint: 0 errors, 0 warnings
- TypeScript: Strict mode, no any
- Complexity: < 10 per function
- Duplication: < 3%

## Test Documentation

### Test Plan Template
```markdown
## Test: [Feature Name]
**Category**: Unit/Integration/E2E
**Priority**: High/Medium/Low
**Coverage**: Functions/Components tested

### Setup
- Prerequisites
- Test data
- Mock requirements

### Test Cases
1. Happy path
2. Error cases
3. Edge cases
4. Performance

### Expected Results
- Success criteria
- Performance metrics
- Error handling

### Cleanup
- Reset state
- Clear cache
- Remove test data
```

## Continuous Improvement

### Metrics Tracking
- Test execution time
- Coverage trends
- Failure rates
- Flaky test identification

### Test Maintenance
- Weekly test review
- Monthly performance baseline update
- Quarterly test refactoring
- Annual test strategy review
# Fluorite-MCP テスト戦略

## テストアーキテクチャ

### テストピラミッド
```
         E2E テスト (10%)
        /            \
    統合テスト (30%)   \
   /                    \
  ユニットテスト (60%)   /
 /_____________________/
```

## テストカテゴリ

### 1. ユニットテスト（60% カバレッジ）

#### CLI コンポーネント
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
      const result = parser.parse('/fl:implement "REST API with auth を作成"');
      expect(result.naturalLanguage).toBe(true);
      expect(result.query).toBe('REST API with auth を作成');
    });
  });
});
```

#### スパイクテンプレートシステム
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

#### コマンドマッピング
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

### 2. 統合テスト（30% カバレッジ）

#### MCP サーバー統合
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

#### Claude CLI 統合
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

#### Serena MCP 統合
```typescript
// src/__tests__/integration/serena.test.ts
describe('Serena MCP Integration', () => {
  it('should enhance natural language commands', async () => {
    const enhanced = await serena.enhance('REST APIを作成');
    expect(enhanced.spikes).toContain('express-rest-api');
    expect(enhanced.command).toBe('/fl:implement');
  });
  
  it('should fallback gracefully', async () => {
    // Serena が利用不可をシミュレート
    serena.disconnect();
    const result = await execute('/fl:implement "APIを作成"');
    expect(result.success).toBe(true);
    expect(result.fallback).toBe(true);
  });
});
```

### 3. エンドツーエンドテスト（10% カバレッジ）

#### 完全ワークフロー
```typescript
// src/__tests__/e2e/workflows.test.ts
describe('E2E Workflows', () => {
  it('should complete full development cycle', async () => {
    // セットアップ
    await execute('fluorite-mcp setup');
    
    // スパイクの発見
    const discovery = await execute('/fl:spike discover "nextjs app"');
    expect(discovery).toContain('nextjs-minimal');
    
    // スパイクの適用
    await execute('/fl:spike apply nextjs-minimal');
    expect(fs.existsSync('next-app/package.json')).toBe(true);
    
    // 機能の実装
    await execute('/fl:implement "認証を追加"');
    expect(fs.existsSync('next-app/auth')).toBe(true);
    
    // テスト
    await execute('/fl:test');
    
    // ドキュメント作成
    await execute('/fl:document');
    expect(fs.existsSync('README.md')).toBe(true);
    
    // コミット
    await execute('/fl:git commit,push');
  });
  
  it('should handle API development workflow', async () => {
    await execute('/fl:spike apply fastapi-minimal');
    await execute('/fl:implement "ユーザー用のCRUDエンドポイント"');
    await execute('/fl:test --api');
    await execute('/fl:document --openapi');
    await execute('/fl:build --docker');
  });
});
```

#### エラー復旧
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

## テストインフラストラクチャ

### テスト環境セットアップ
```typescript
// src/test/setup.ts
export async function setupTestEnvironment() {
  // 一時ディレクトリの作成
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fluorite-test-'));
  
  // Claude CLI のモック
  const mockClaude = new MockClaudeCLI(tempDir);
  
  // テストスパイクのセットアップ
  await copyTestSpikes(tempDir);
  
  // テスト MCP サーバーの開始
  const server = await startTestMCPServer();
  
  return { tempDir, mockClaude, server };
}
```

### モックシステム
```typescript
// src/test/mocks/claude-cli.mock.ts
export class MockClaudeCLI {
  constructor(private tempDir: string) {
    this.configPath = path.join(tempDir, '.claude');
  }
  
  async executeCommand(command: string): Promise<Result> {
    // Claude CLI 実行をシミュレート
    return this.commandHandler.handle(command);
  }
  
  async addMCPServer(name: string, command: string): Promise<void> {
    // MCP サーバー登録をシミュレート
  }
}
```

### テストデータフィクスチャ
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
  // その他のテストスパイク...
];
```

## パフォーマンステスト

### ベンチマークスイート
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

### 負荷テスト
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
    // キャッシュを満たす
    for (let i = 0; i < 1000; i++) {
      await cache.set(`key-${i}`, `value-${i}`);
    }
    
    // メモリ使用量をチェック
    const memUsage = process.memoryUsage();
    expect(memUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // < 100MB
  });
});
```

## テスト自動化

### CI/CD パイプライン
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

### テストスクリプト
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

## 品質ゲート

### カバレッジ要件
- 全体: > 80%
- ユニットテスト: > 90%
- 統合テスト: > 70%
- クリティカルパス: 100%

### パフォーマンス閾値
- コマンド解析: < 10ms
- スパイク適用: < 2s
- セットアップ完了: < 60s
- メモリ使用量: < 100MB

### コード品質
- ESLint: 0エラー、0警告
- TypeScript: Strictモード、anyなし
- 複雑度: 関数あたり < 10
- 重複: < 3%

## テストドキュメント

### テスト計画テンプレート
```markdown
## テスト: [機能名]
**カテゴリ**: Unit/Integration/E2E
**優先度**: High/Medium/Low
**カバレッジ**: テストする関数/コンポーネント

### セットアップ
- 前提条件
- テストデータ
- モック要件

### テストケース
1. ハッピーパス
2. エラーケース
3. エッジケース
4. パフォーマンス

### 期待される結果
- 成功基準
- パフォーマンス指標
- エラーハンドリング

### クリーンアップ
- 状態のリセット
- キャッシュのクリア
- テストデータの削除
```

## 継続的改善

### 指標追跡
- テスト実行時間
- カバレッジトレンド
- 失敗率
- 不安定なテストの特定

### テストメンテナンス
- 週次テストレビュー
- 月次パフォーマンスベースライン更新
- 四半期テストリファクタリング
- 年次テスト戦略レビュー
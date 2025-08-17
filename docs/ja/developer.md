# 開発者ガイド

Fluorite MCP の開発、カスタマイズ、拡張に関する包括的な開発者向けガイドです。

## 🎯 概要

このガイドでは以下について詳しく説明します：
- Fluorite MCP のアーキテクチャ
- カスタム拡張の開発方法
- 貢献プロセス
- 高度なカスタマイズ

## 🏗️ アーキテクチャ概要

### システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Claude CLI    │ ── │  Fluorite MCP   │ ── │  Specification  │
│                 │    │     Server      │    │    Database     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              │
                       ┌─────────────────┐
                       │  Spike Template │
                       │     Engine      │
                       └─────────────────┘
```

### 主要コンポーネント

1. **MCP Server**: Claude CLI との通信
2. **Specification Engine**: ライブラリ仕様の管理
3. **Template Engine**: スパイクテンプレートの処理
4. **Cache System**: パフォーマンス最適化
5. **Static Analysis**: コード分析機能

## 🔧 開発環境セットアップ

### 前提条件

```bash
# Node.js 18以上
node --version  # v18.0.0+

# 開発ツール
npm install -g typescript
npm install -g @types/node
npm install -g jest
```

### リポジトリのクローン

```bash
git clone https://github.com/kotsutsumi/fluorite-mcp.git
cd fluorite-mcp
npm install
```

### 開発サーバー起動

```bash
# 開発モード
npm run dev

# ウォッチモード
npm run watch

# テスト実行
npm test
```

## 📁 プロジェクト構造

```
fluorite-mcp/
├── src/
│   ├── server/           # MCP サーバー実装
│   ├── specifications/   # ライブラリ仕様
│   ├── templates/        # スパイクテンプレート
│   ├── analysis/         # 静的解析エンジン
│   ├── cache/           # キャッシュシステム
│   └── utils/           # ユーティリティ
├── tests/               # テストファイル
├── docs/                # ドキュメント
└── examples/            # 使用例
```

## 🧩 カスタム拡張開発

### プラグインシステム

#### 基本プラグイン構造

```typescript
// src/plugins/my-plugin.ts
import { Plugin, PluginContext } from '../types/plugin';

export class MyCustomPlugin implements Plugin {
  name = 'my-custom-plugin';
  version = '1.0.0';

  async initialize(context: PluginContext): Promise<void> {
    // 初期化ロジック
  }

  async process(input: any, context: PluginContext): Promise<any> {
    // 処理ロジック
    return processedOutput;
  }

  async cleanup(): Promise<void> {
    // クリーンアップロジック
  }
}
```

#### プラグイン登録

```typescript
// src/plugins/index.ts
import { MyCustomPlugin } from './my-plugin';
import { PluginManager } from '../core/plugin-manager';

const pluginManager = new PluginManager();
pluginManager.register(new MyCustomPlugin());
```

### カスタム仕様作成

#### 仕様ファイル形式

```yaml
# specifications/my-library.yaml
metadata:
  name: "my-custom-library"
  version: "1.0.0"
  description: "カスタムライブラリの説明"
  
library:
  name: "my-custom-library"
  npm: "my-custom-library"
  language: "typescript"
  
usage_patterns:
  basic:
    description: "基本的な使用方法"
    code: |
      import { MyComponent } from 'my-custom-library';
      
      function App() {
        return <MyComponent />;
      }
```

#### 動的仕様生成

```typescript
// src/specifications/generators/my-spec-generator.ts
import { SpecificationGenerator } from '../types/specification';

export class MySpecGenerator implements SpecificationGenerator {
  async generate(library: string): Promise<Specification> {
    // 外部APIから情報取得
    const apiData = await fetchLibraryInfo(library);
    
    return {
      metadata: {
        name: library,
        version: apiData.version,
        description: apiData.description
      },
      usage_patterns: this.generateUsagePatterns(apiData),
      best_practices: this.generateBestPractices(apiData)
    };
  }
}
```

## 🧪 テスト戦略

### 単体テスト

```typescript
// tests/unit/specification-loader.test.ts
import { SpecificationLoader } from '../src/specifications/loader';

describe('SpecificationLoader', () => {
  let loader: SpecificationLoader;

  beforeEach(() => {
    loader = new SpecificationLoader();
  });

  it('should load valid specification', async () => {
    const spec = await loader.load('react');
    expect(spec).toBeDefined();
    expect(spec.metadata.name).toBe('react');
  });

  it('should handle missing specification', async () => {
    await expect(loader.load('non-existent')).rejects.toThrow();
  });
});
```

### 統合テスト

```typescript
// tests/integration/mcp-server.test.ts
import { MCPServer } from '../src/server/mcp-server';
import { MockClaudeClient } from './mocks/claude-client';

describe('MCP Server Integration', () => {
  let server: MCPServer;
  let mockClient: MockClaudeClient;

  beforeEach(async () => {
    server = new MCPServer();
    mockClient = new MockClaudeClient();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should handle specification request', async () => {
    const response = await mockClient.request('get_specification', {
      library: 'react'
    });
    
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
```

### E2Eテスト

```typescript
// tests/e2e/workflow.test.ts
import { spawn } from 'child_process';

describe('End-to-End Workflow', () => {
  it('should complete full generation workflow', async () => {
    // Claude CLI経由でのテスト
    const process = spawn('claude', ['ask', 'Create a React component with TypeScript']);
    
    return new Promise((resolve, reject) => {
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          expect(output).toContain('React.FC');
          expect(output).toContain('TypeScript');
          resolve(undefined);
        } else {
          reject(new Error(`Process failed with code ${code}`));
        }
      });
    });
  });
});
```

## 🔍 デバッグとプロファイリング

### ログ設定

```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### パフォーマンス監視

```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(operation: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  recordMetric(operation: string, value: number): void {
    const values = this.metrics.get(operation) || [];
    values.push(value);
    this.metrics.set(operation, values);
  }

  getStats(operation: string) {
    const values = this.metrics.get(operation) || [];
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }
}
```

## 📦 ビルドとリリース

### ビルド設定

```json
// package.json
{
  "scripts": {
    "build": "tsc && npm run bundle",
    "bundle": "webpack --mode=production",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

### 継続的インテグレーション

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - run: npm ci
    - run: npm run lint
    - run: npm test
    - run: npm run build
```

### リリースプロセス

```bash
# バージョン更新
npm version patch  # または minor, major

# ビルド
npm run build

# テスト実行
npm test

# パブリッシュ
npm publish

# Gitタグプッシュ
git push --tags
```

## 🤝 貢献ガイドライン

### 開発フロー

1. **Issue作成**: 機能リクエストやバグ報告
2. **フォーク**: リポジトリをフォーク
3. **ブランチ作成**: 機能ブランチを作成
4. **開発**: コード変更とテスト追加
5. **プルリクエスト**: 変更をレビューに提出

### コードスタイル

```typescript
// 推奨されるコードスタイル例
export interface LibrarySpecification {
  readonly metadata: SpecificationMetadata;
  readonly usagePatterns: Record<string, UsagePattern>;
  readonly bestPractices: string[];
}

export class SpecificationLoader {
  private readonly cache = new Map<string, LibrarySpecification>();

  async load(libraryName: string): Promise<LibrarySpecification> {
    if (this.cache.has(libraryName)) {
      return this.cache.get(libraryName)!;
    }

    const specification = await this.loadFromFile(libraryName);
    this.cache.set(libraryName, specification);
    return specification;
  }

  private async loadFromFile(libraryName: string): Promise<LibrarySpecification> {
    // 実装
  }
}
```

### ドキュメント更新

```markdown
# プルリクエストテンプレート

## 変更内容
- [ ] 新機能追加
- [ ] バグ修正
- [ ] ドキュメント更新
- [ ] リファクタリング

## テスト
- [ ] 単体テスト追加
- [ ] 統合テスト追加
- [ ] 既存テストの更新

## ドキュメント
- [ ] README更新
- [ ] API文書更新
- [ ] 使用例追加
```

## 🚀 高度なカスタマイズ

### カスタムMCPツール

```typescript
// src/tools/custom-tool.ts
import { Tool, ToolContext } from '../types/tool';

export class CustomAnalysisTool implements Tool {
  name = 'custom_analysis';
  description = 'カスタム解析ツール';

  async execute(params: any, context: ToolContext): Promise<any> {
    // カスタム解析ロジック
    const analysisResult = await this.performAnalysis(params.code);
    
    return {
      success: true,
      data: analysisResult,
      suggestions: this.generateSuggestions(analysisResult)
    };
  }

  private async performAnalysis(code: string) {
    // 解析実装
  }

  private generateSuggestions(result: any): string[] {
    // 提案生成
  }
}
```

### カスタムミドルウェア

```typescript
// src/middleware/custom-middleware.ts
import { Middleware, MiddlewareContext } from '../types/middleware';

export class SecurityMiddleware implements Middleware {
  async process(request: any, context: MiddlewareContext, next: Function): Promise<any> {
    // セキュリティチェック
    if (!this.validateRequest(request)) {
      throw new Error('Invalid request');
    }

    // ログ記録
    this.logRequest(request);

    // 次のミドルウェアまたはハンドラーを実行
    const response = await next();

    // レスポンス後処理
    this.logResponse(response);

    return response;
  }

  private validateRequest(request: any): boolean {
    // バリデーションロジック
  }

  private logRequest(request: any): void {
    // ログ記録
  }

  private logResponse(response: any): void {
    // レスポンスログ
  }
}
```

---

**開発に関する質問**: [GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions) の Developer カテゴリでお気軽にご質問ください。
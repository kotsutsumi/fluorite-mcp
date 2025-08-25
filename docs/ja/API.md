# APIリファレンス

詳細なエンドポイント、パラメーター、例を含むFluorite MCPの完全なAPIリファレンスです。

## 📖 目次

- [MCPプロトコル概要](#mcpプロトコル概要)
- [利用可能なツール](#利用可能なツール)
- [ツールパラメーター](#ツールパラメーター)
- [レスポンス形式](#レスポンス形式)
- [エラーハンドリング](#エラーハンドリング)
- [使用例](#使用例)

---

## MCPプロトコル概要

Fluorite MCPは、Claude Code CLIとのシームレスな統合を提供するため、Model Context Protocol（MCP）を実装しています。すべての相互作用は、ツールとリソースの標準的なMCPパターンに従います。

### サーバー情報

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

### 接続

```bash
# Claude Code CLI経由の標準接続
claude mcp add fluorite-mcp -- fluorite-mcp

# 開発用直接接続
fluorite-mcp --stdio
```

---

## 利用可能なツール

Fluorite MCPは、4つの主要カテゴリにわたって15の専門ツールを提供します：

### 仕様管理（3ツール）

| ツール | 目的 | パラメーター |
|-------|------|-------------|
| `list-specs` | ライブラリ仕様一覧 | `filter?: string` |
| `upsert-spec` | 仕様作成/更新 | `pkg: string, yaml: string` |
| `catalog-stats` | カタログ統計取得 | なし |

### 静的解析（4ツール）

| ツール | 目的 | パラメーター |
|-------|------|-------------|
| `static-analysis` | 包括的コード解析 | 複数オプション |
| `quick-validate` | 高速コード検証 | `code: string, language?: string` |
| `realtime-validation` | ファイル検証 | `file: string, framework?: string` |
| `get-validation-rules` | 利用可能ルール一覧 | なし |

### スパイク開発（6ツール）

| ツール | 目的 | パラメーター |
|-------|------|-------------|
| `discover-spikes` | スパイクテンプレート検索 | `query?: string, limit?: number` |
| `auto-spike` | AI駆動スパイク選択 | `task: string, constraints?: object` |
| `preview-spike` | テンプレートプレビュー | `id: string, params?: object` |
| `apply-spike` | テンプレート適用 | `id: string, params?: object` |
| `validate-spike` | 適用済みスパイク検証 | `id: string, params?: object` |
| `explain-spike` | スパイクドキュメント取得 | `id: string` |

### 診断（2ツール）

| ツール | 目的 | パラメーター |
|-------|------|-------------|
| `self-test` | サーバー診断 | なし |
| `performance-test` | パフォーマンス測定 | なし |

---

## ツールパラメーター

### `static-analysis`

フレームワーク固有のルールを持つ包括的な静的解析。

```typescript
interface StaticAnalysisParams {
  projectPath: string;                    // プロジェクトルートディレクトリ
  framework?: string;                     // 対象フレームワーク（省略時は自動検出）
  targetFiles?: string[];                 // 解析対象の特定ファイル
  strictMode?: boolean;                   // 厳密検証を有効化
  predictErrors?: boolean;                // エラー予測を有効化
  analyzeDependencies?: boolean;          // 依存関係解析
  autoFix?: boolean;                      // 自動修正提案を生成
  maxIssues?: number;                     // 報告する問題数の制限
  enabledRules?: string[];               // 有効にする特定ルール
  disabledRules?: string[];              // 無効にする特定ルール
}
```

### `auto-spike`

自然言語タスクに基づくAI駆動のスパイクテンプレート選択。

```typescript
interface AutoSpikeParams {
  task: string;                          // 自然言語タスク記述
  constraints?: {                        // オプションの制約
    framework?: string;                  // 優先フレームワーク
    complexity?: 'simple' | 'moderate' | 'complex';
    timeLimit?: number;                  // 最大推定時間（分）
    dependencies?: string[];             // 必要な依存関係
    [key: string]: any;                  // 追加制約
  };
}
```

### `apply-spike`

パラメーターを指定してスパイクテンプレートを適用。

```typescript
interface ApplySpikeParams {
  id: string;                           // スパイクテンプレートID
  params?: Record<string, any>;         // テンプレートパラメーター
  strategy?: 'overwrite' | 'three_way_merge' | 'abort'; // 競合解決戦略
}
```

---

## レスポンス形式

### 成功レスポンス

すべての成功したツール呼び出しは標準化された形式を返します：

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

### エラーレスポンス

エラーレスポンスには詳細なエラー情報が含まれます：

```typescript
interface ErrorResponse {
  content: Array<{
    type: 'text';
    text: string;  // エラーメッセージ
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

## エラーハンドリング

### 一般的なエラータイプ

| エラータイプ | 説明 | 解決方法 |
|------------|------|----------|
| `INVALID_PARAMS` | 無効または不足パラメーター | パラメーター形式と要件を確認 |
| `FILE_NOT_FOUND` | 対象ファイル/ディレクトリが見つからない | ファイルパスと権限を確認 |
| `ANALYSIS_FAILED` | 静的解析エラー | プロジェクト構造と依存関係を確認 |
| `SPIKE_NOT_FOUND` | スパイクテンプレートが見つからない | `discover-spikes`で利用可能テンプレートを検索 |
| `VALIDATION_ERROR` | コード検証失敗 | 検証エラーを確認してコード問題を修正 |
| `DEPENDENCY_ERROR` | 依存関係不足 | 必要な依存関係をインストール |
| `PERMISSION_ERROR` | ファイルシステム権限拒否 | ファイル/ディレクトリ権限を確認 |

### エラー回復

```typescript
// リトライロジック付きエラーハンドリング例
async function callToolWithRetry(toolName: string, params: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.callTool(toolName, params);
      
      if (result.isError) {
        console.error(`ツールエラー（試行${attempt}回目）:`, result.content[0].text);
        
        // エラーが回復可能かチェック
        if (isRecoverableError(result.metadata?.errorType)) {
          await delay(1000 * attempt); // 指数バックオフ
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

## 使用例

### 基本的な仕様管理

```typescript
// 利用可能な全仕様を一覧表示
const specs = await client.callTool('list-specs', {});
console.log(`${specs.metadata.totalCount}個の仕様が見つかりました`);

// 技術別に仕様をフィルタリング
const reactSpecs = await client.callTool('list-specs', { filter: 'react' });

// カタログ統計を取得
const stats = await client.callTool('catalog-stats', {});
console.log(`総仕様数: ${stats.metadata.totalSpecs}`);
```

### 静的解析ワークフロー

```typescript
// 包括的プロジェクト解析
const analysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/project',
  framework: 'nextjs',
  predictErrors: true,
  analyzeDependencies: true,
  maxIssues: 50
});

// 高速コード検証
const validation = await client.callTool('quick-validate', {
  code: `
    function MyComponent() {
      return <div>Hello World</div>;
    }
  `,
  language: 'tsx'
});

// リアルタイムファイル検証
const fileValidation = await client.callTool('realtime-validation', {
  file: '/path/to/component.tsx',
  framework: 'react'
});
```

### スパイク開発ワークフロー

```typescript
// 関連するスパイクテンプレートを発見
const spikes = await client.callTool('discover-spikes', {
  query: 'react typescript component',
  limit: 10
});

// AIを使用して最適なスパイクを選択
const autoSpike = await client.callTool('auto-spike', {
  task: 'TypeScriptサポート付きの再利用可能なボタンコンポーネントを作成',
  constraints: {
    framework: 'react',
    complexity: 'simple',
    timeLimit: 30
  }
});

// 適用前にスパイクをプレビュー
const preview = await client.callTool('preview-spike', {
  id: autoSpike.metadata.selectedSpikeId,
  params: {
    componentName: 'Button',
    includeStorybook: true
  }
});

// スパイクテンプレートを適用
const applied = await client.callTool('apply-spike', {
  id: autoSpike.metadata.selectedSpikeId,
  params: {
    componentName: 'Button',
    includeStorybook: true,
    includeTests: true
  }
});

// 適用されたスパイクを検証
const validation = await client.callTool('validate-spike', {
  id: autoSpike.metadata.selectedSpikeId,
  params: {
    componentName: 'Button'
  }
});
```

### カスタムルールを使った高度な解析

```typescript
// 利用可能な検証ルールを取得
const rules = await client.callTool('get-validation-rules', {});

// 特定のルールで解析を実行
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

### エラーハンドリング例

```typescript
try {
  const result = await client.callTool('static-analysis', {
    projectPath: '/nonexistent/path'
  });
} catch (error) {
  if (error.isError && error.metadata?.errorType === 'FILE_NOT_FOUND') {
    console.log('プロジェクトパスが見つかりません。パスを確認して再試行してください。');
    
    // 代替パスを提案
    if (error.metadata?.suggestions) {
      console.log('提案パス:', error.metadata.suggestions);
    }
  } else {
    console.error('予期しないエラー:', error.content[0].text);
  }
}
```

### パフォーマンス監視

```typescript
// パフォーマンス診断を実行
const perfTest = await client.callTool('performance-test', {});
console.log(`解析パフォーマンス: ${perfTest.metadata.analysisTimeMs}ms`);

// サーバーヘルスチェック
const healthCheck = await client.callTool('self-test', {});
if (healthCheck.metadata.healthy) {
  console.log('✅ サーバーは正常です');
} else {
  console.warn('⚠️ サーバー問題を検出:', healthCheck.metadata.issues);
}
```

### バッチ操作

```typescript
// 複数ファイルを並列解析
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

// 結果を処理
validations.forEach((validation, index) => {
  if (validation.isError) {
    console.error(`${files[index]}の検証が失敗:`, validation.content[0].text);
  } else {
    console.log(`✅ ${files[index]}が正常に検証されました`);
  }
});
```

---

## レート制限とパフォーマンス

### レート制限

| 操作タイプ | 制限 | 期間 |
|-----------|------|------|
| 静的解析 | 10リクエスト | 1分あたり |
| スパイク操作 | 20リクエスト | 1分あたり |
| 仕様クエリ | 100リクエスト | 1分あたり |
| 診断 | 5リクエスト | 1分あたり |

### パフォーマンスのヒント

1. **バッチ操作を使用**: 可能な場合は関連操作をグループ化
2. **結果をキャッシュ**: 変更されていないファイルの解析結果をキャッシュ
3. **フィルターを最適化**: レスポンスサイズを減らすために特定のフィルターを使用
4. **パフォーマンスを監視**: 診断ツールを使用してパフォーマンスを追跡
5. **エラーを適切に処理**: 適切なエラーハンドリングとリトライを実装

### レスポンス時間ガイドライン

| 操作 | 典型的なレスポンス時間 | 最大レスポンス時間 |
|------|---------------------|-------------------|
| `list-specs` | 50-100ms | 500ms |
| `static-analysis` | 500ms-5s | 30s |
| `discover-spikes` | 100-300ms | 2s |
| `apply-spike` | 200ms-2s | 10s |
| 診断 | 50-200ms | 1s |

---

## SDK統合

### Node.js SDK例

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

// 使用方法
const fluorite = new FluoriteMCPClient();
await fluorite.initialize();

const analysis = await fluorite.analyzeProject('./my-project');
const spikes = await fluorite.findSpikes('react component');

await fluorite.disconnect();
```

---

*詳細な関数ドキュメントについては、[関数リファレンス](./function-reference.md)を参照してください。*

*統合パターンについては、[統合ガイド](./integration-guide.md)を参照してください。*
# Fluorite コマンドマッピング仕様

## コマンドマッピングアーキテクチャ

### 基本マッピング構造
```typescript
interface FluoriteCommand {
  pattern: RegExp;                    // /fl:command パターン
  superclaudeCommand: string;         // 対応する /sc:command
  enhancers: CommandEnhancer[];       // 前処理/後処理プロセッサ
  spikeIntegration: SpikeConfig;      // スパイクテンプレート統合
  serenaEnabled: boolean;             // 自然言語処理
  tokenOptimization: boolean;         // キャッシュと圧縮
  customLogic?: Function;             // コマンド固有のロジック
}
```

## コアコマンドマッピング

### 1. Git 操作

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
        // 絵文字と慣例的コミット形式の追加
        // 詳細なコミット本文の生成
        // イシュー参照の追加
      }
    },
    {
      type: 'post',
      name: 'git-hooks-validator',
      action: (result) => {
        // コミットフックの検証
        // プッシュ前チェックの実行
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

### 2. 分析コマンド

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
        // プロジェクト構造の自動検出
        // フレームワークとパターンの特定
        // 分析コンテキストの生成
      }
    },
    {
      type: 'post',
      name: 'report-generator',
      action: async (result) => {
        // ビジュアルレポートの生成
        // 実行可能な推奨事項の作成
        // 分析キャッシュの保存
      }
    }
  ],
  spikeIntegration: {
    templates: ['code-analysis', 'architecture-review'],
    contextAware: true
  },
  serenaEnabled: true,
  customLogic: async (args) => {
    // fluorite の静的解析ツールを使用
    // 依存関係アナライザーとの統合
    // エラー予測器の活用
  }
}
```

### 3. 実装コマンド

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
        // 自然言語要件の解析
        // スパイクテンプレートとのマッチング
        // 実装コンテキストの準備
      }
    },
    {
      type: 'during',
      name: 'code-generator',
      action: async (context) => {
        // スパイクテンプレートの適用
        // ボイラープレートの生成
        // プロジェクト構造のセットアップ
      }
    },
    {
      type: 'post',
      name: 'dependency-installer',
      action: async (result) => {
        // 必要なパッケージのインストール
        // 設定ファイルのセットアップ
        // 初期化スクリプトの実行
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
    // 自然言語からスパイクへのマッピング
    // 例: "認証付きREST APIを作成" ->
    // スパイク: ['express-minimal', 'jwt-auth', 'rest-api-crud']
  }
}
```

### 4. ビルドコマンド

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
        // ビルドシステムの検出
        // 設定の最適化
        // キャッシュのセットアップ
      }
    },
    {
      type: 'post',
      name: 'artifact-manager',
      action: async (result) => {
        // ビルド成果物の保存
        // ビルドレポートの生成
        // バージョン情報の更新
      }
    }
  ],
  spikeIntegration: {
    templates: ['build-configs', 'ci-cd-pipelines']
  },
  tokenOptimization: true
}
```

### 5. テストコマンド

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
        // スパイクからテストケースの生成
        // テスト環境のセットアップ
        // テストランナーの設定
      }
    },
    {
      type: 'post',
      name: 'coverage-reporter',
      action: async (result) => {
        // カバレッジレポートの生成
        // 未テストコードの特定
        // 追加テストの提案
      }
    }
  ],
  spikeIntegration: {
    templates: ['jest-setup', 'playwright-e2e', 'vitest-config']
  },
  serenaEnabled: true
}
```

### 6. ドキュメントコマンド

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
        // ドキュメント用コードの分析
        // API シグネチャの抽出
        // サンプルの生成
      }
    },
    {
      type: 'post',
      name: 'doc-formatter',
      action: async (result) => {
        // 異なる出力形式での整形
        // API ドキュメントの生成
        // README セクションの作成
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

### 7. 改善コマンド

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
        // 現在のコード品質の分析
        // 改善領域の特定
        // 変更の優先順位付け
      }
    },
    {
      type: 'during',
      name: 'refactoring-engine',
      action: async (context) => {
        // ベストプラクティスの適用
        // コードパターンのリファクタリング
        // パフォーマンスの最適化
      }
    }
  ],
  spikeIntegration: {
    templates: ['refactoring-patterns', 'performance-optimizations']
  },
  customLogic: async (args) => {
    // fluorite の静的アナライザーを使用
    // エラー予測器の適用
    // 改善提案
  }
}
```

## 特別な Fluorite コマンド

### /fl:spike
```typescript
{
  pattern: /^\/fl:spike\s+(\w+)\s*(.*)$/,
  subcommands: {
    'discover': async (query) => {
      // スパイクテンプレートの検索
      // ランク付けされた結果の返却
    },
    'apply': async (templateId, params) => {
      // スパイクテンプレートの適用
      // コードの生成
    },
    'create': async (config) => {
      // 新しいスパイクテンプレートの作成
      // 検証と保存
    },
    'list': async (filter) => {
      // 利用可能なスパイクの一覧表示
      // カテゴリの表示
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
    // Claude CLI インストールの確認
    // MCP サーバーのインストール
    // ~/.claude の設定
    // コマンドエイリアスのセットアップ
    // スパイクテンプレートの初期化
    // インストールの検証
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
      // 設定値の設定
    },
    'get': async (key) => {
      // 設定値の取得
    },
    'list': async () => {
      // 全設定の一覧表示
    },
    'reset': async () => {
      // デフォルトにリセット
    }
  }
}
```

## 自然言語処理

### Serena 統合例
```typescript
// 自然言語からコマンドへのマッピング
const nlpMappings = {
  "認証付きREST APIを作成": {
    command: "/fl:implement",
    spikes: ["express-rest-api", "jwt-auth"],
    flags: ["--typescript", "--postgres"]
  },
  "アーキテクチャを分析": {
    command: "/fl:analyze",
    flags: ["--focus", "architecture", "--depth", "deep"]
  },
  "テストをセットアップ": {
    command: "/fl:implement",
    spikes: ["jest-setup", "playwright-e2e"],
    followUp: "/fl:test"
  },
  "パフォーマンスを最適化": {
    command: "/fl:improve",
    flags: ["--focus", "performance"],
    analysis: "/fl:analyze --focus performance"
  }
};
```

## トークン最適化戦略

### キャッシュシステム
```typescript
interface CacheStrategy {
  key: string;           // キャッシュキー生成
  ttl: number;          // 存続時間
  compression: boolean;  // 圧縮の有効化
  shared: boolean;      // コマンド間での共有
}

const cacheStrategies = {
  '/fl:analyze': {
    key: (args) => `analyze:${hashArgs(args)}`,
    ttl: 3600,  // 1時間
    compression: true,
    shared: true
  },
  '/fl:spike': {
    key: (template) => `spike:${template}`,
    ttl: 86400, // 24時間
    compression: false,
    shared: true
  }
};
```

### 圧縮技術
```typescript
const compressionConfig = {
  enabled: true,
  algorithm: 'gzip',
  level: 6,
  threshold: 1024, // 1KB以上で圧縮
  excludePatterns: [/\.min\./, /\.gz$/]
};
```

## コマンドチェーン

### ワークフロー例
```typescript
// 開発ワークフロー
const workflows = {
  'full-stack-app': [
    '/fl:spike discover "nextjs typescript"',
    '/fl:spike apply nextjs-typescript',
    '/fl:implement "認証システム"',
    '/fl:implement "データベースモデル"',
    '/fl:test --generate',
    '/fl:document --api',
    '/fl:git commit,push'
  ],
  'api-development': [
    '/fl:spike apply fastapi-minimal',
    '/fl:implement "CRUD エンドポイント"',
    '/fl:implement "認証"',
    '/fl:test --api',
    '/fl:document --openapi',
    '/fl:build --docker'
  ]
};
```

## エラーハンドリング

### コマンドエラー復旧
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
      // 類似スパイクの提案
      // 新しいスパイク作成の提示
    },
    fallback: '/fl:spike discover'
  },
  {
    pattern: /command failed/i,
    recovery: async (error, args) => {
      // 異なるパラメータでの再試行
      // SuperClaude へのフォールバック
    },
    fallback: '/sc:' // 直接 SuperClaude
  }
];
```
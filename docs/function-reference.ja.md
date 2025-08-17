# 関数リファレンス - 包括的ガイド

Fluorite MCPの全機能の詳細な例、パラメータ、使用パターンを含む完全なドキュメント。

## 📖 目次

- [MCPツール概要](#mcpツール概要)
- [仕様管理](#仕様管理)
- [静的解析ツール](#静的解析ツール)
- [Spike開発ツール](#spike開発ツール)
- [診断ツール](#診断ツール)
- [エラーハンドリング](#エラーハンドリング)
- [ベストプラクティス](#ベストプラクティス)

## MCPツール概要

Fluorite MCPは4つの主要カテゴリに整理された15の専門ツールを提供します：

| カテゴリ | ツール数 | 目的 |
|----------|---------|------|
| **仕様管理** | 3ツール | ライブラリ仕様とカタログ操作 |
| **静的解析** | 4ツール | コード解析と検証 |
| **Spike開発** | 6ツール | 迅速なプロトタイピングとテンプレート |
| **診断** | 3ツール | サーバーヘルスとパフォーマンス監視 |

---

## 仕様管理

### 1. list-specs

**目的**: カタログ内の利用可能なライブラリ仕様をオプションのフィルタリングで一覧表示。

**パラメータ**:
```typescript
{
  filter?: string  // パッケージ名の任意のフィルタパターン
}
```

**使用例**:

#### 基本的な一覧表示
```typescript
// 全ての仕様を一覧表示
const allSpecs = await client.callTool('list-specs', {});

// 期待される応答:
{
  content: [{
    type: "text",
    text: "Found 87 specification(s):\n\nshadcn__ui\ntanstack-table\nnextauth\nprisma\n..."
  }]
}
```

#### フィルタリング一覧表示
```typescript
// React関連の仕様を一覧表示
const reactSpecs = await client.callTool('list-specs', {
  filter: 'react'
});

// Next.js仕様を一覧表示
const nextSpecs = await client.callTool('list-specs', {
  filter: 'next'
});

// 認証ライブラリを一覧表示
const authSpecs = await client.callTool('list-specs', {
  filter: 'auth'
});
```

**自然言語での使用**:
```
「利用可能なライブラリ仕様を全て表示してください」
「React関連の仕様を一覧表示してください」
「どのような認証ライブラリが利用可能ですか？」
```

**応答形式**:
- **成功**: マッチした全ての仕様のテキスト一覧
- **空**: 仕様が見つからなかった旨のメッセージ
- **エラー**: 詳細なエラーメッセージ

---

### 2. upsert-spec

**目的**: カタログ内のライブラリ仕様を作成または更新。

**パラメータ**:
```typescript
{
  pkg: string      // パッケージ識別子（最大255文字）
  yaml: string     // YAML仕様コンテンツ（最大1MB）
}
```

**使用例**:

#### 新しい仕様の作成
```typescript
const customSpec = `
name: カスタムライブラリ
version: 1.0.0
description: 特殊機能用のカスタムライブラリ
category: custom-tools
homepage: https://mycustomlibrary.dev
repository: https://github.com/myorg/my-custom-library
language: TypeScript

features:
  - カスタムデータ処理
  - 型安全なAPI
  - 高性能アルゴリズム

configuration: |
  import { MyLibrary } from 'my-custom-library';
  
  const lib = new MyLibrary({
    apiKey: process.env.API_KEY,
    enableCache: true
  });

best_practices:
  - 常に入力データを検証する
  - より良い型安全性のためTypeScriptを使用する
  - パフォーマンス向上のためキャッシュを有効にする
`;

const result = await client.callTool('upsert-spec', {
  pkg: 'my-custom-library',
  yaml: customSpec
});
```

**検証ルール**:
- パッケージ名: 1-255文字、英数字とダッシュ/アンダースコア
- YAMLコンテンツ: 有効なYAML構文、最大1MBサイズ
- 必須フィールド: `name`、`description`、`category`

**自然言語での使用**:
```
「カスタム認証ライブラリの仕様を追加してください」
「React Hook Formの仕様を新しい例で更新してください」
「内部UIコンポーネントライブラリの仕様を作成してください」
```

---

### 3. catalog-stats

**目的**: 仕様カタログの包括的な統計情報を表示。

**パラメータ**: なし

**使用例**:

#### 基本的な統計情報
```typescript
const stats = await client.callTool('catalog-stats', {});

// 例の応答:
{
  content: [{
    type: "text",
    text: `カタログ統計:
• 総仕様数: 87
• 場所: /path/to/catalog
• 拡張子別:
  - .yaml: 85
  - .json: 2
• 最終更新: 2025-08-15T10:30:00.000Z`
  }]
}
```

**提供される情報**:
- **総数**: カタログ内の仕様数
- **保存場所**: カタログディレクトリのファイルシステムパス
- **ファイルタイプ**: ファイル拡張子別の内訳（.yaml、.json）
- **最終更新**: 最新の変更のタイムスタンプ
- **サイズ情報**: 総カタログサイズと平均仕様サイズ

**自然言語での使用**:
```
「カタログ統計を表示してください」
「利用可能な仕様数はいくつですか？」
「ライブラリカタログの現在の状態は？」
```

---

## 静的解析ツール

### 4. static-analysis

**目的**: フレームワーク固有のルールとエラー予測を用いたコードプロジェクトの包括的な静的解析を実行。

**パラメータ**:
```typescript
{
  projectPath: string              // プロジェクトルートディレクトリパス（必須）
  targetFiles?: string[]           // 解析する特定のファイル
  framework?: "nextjs"|"react"|"vue"  // ターゲットフレームワーク
  strictMode?: boolean             // 厳密検証モードを有効化
  maxIssues?: number              // 報告する最大問題数
  enabledRules?: string[]         // 有効にする特定のルール
  disabledRules?: string[]        // 無効にする特定のルール
  autoFix?: boolean               // 自動修正提案を生成
  analyzeDependencies?: boolean   // 依存関係を解析
  predictErrors?: boolean         // エラー予測を有効化
}
```

**使用例**:

#### 基本的なプロジェクト解析
```typescript
const analysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/my-project',
  framework: 'nextjs',
  predictErrors: true
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `静的解析結果:

🔍 解析サマリー:
• 解析ファイル数: 45
• エラー: 3
• 警告: 12
• 情報: 5

❌ 重要な問題:
1. app/page.tsx:15 - クライアントフック useState がサーバーコンポーネントで使用されています
   修正: ファイルの先頭に 'use client' ディレクティブを追加

2. components/UserProfile.tsx:23 - ハイドレーションミスマッチの可能性
   修正: クライアントサイドのみの操作にはuseEffectを使用

⚠️ 警告:
1. utils/helpers.ts:8 - 未使用のインポート 'debounce'
2. components/Button.tsx:45 - アクセシビリティ属性が不足

🔮 エラー予測:
1. HydrationError (85%の確率) - SSRコンポーネントでのDate.now()
2. TypeScriptエラー (72%の確率) - 型注釈が不足
`
  }]
}
```

#### フレームワーク固有の解析
```typescript
// Next.js固有の解析
const nextAnalysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/nextjs-app',
  framework: 'nextjs',
  enabledRules: [
    'nextjs-client-server-boundary',
    'nextjs-hydration-check',
    'nextjs-image-optimization'
  ],
  strictMode: true
});

// React固有の解析
const reactAnalysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/react-app',
  framework: 'react',
  enabledRules: [
    'react-hooks-deps',
    'react-hooks-order',
    'react-accessibility'
  ],
  autoFix: true
});

// Vue固有の解析
const vueAnalysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/vue-app',
  framework: 'vue',
  enabledRules: [
    'vue-composition-api',
    'vue-template-syntax',
    'vue-reactivity'
  ]
});
```

**解析カテゴリ**:

| フレームワーク | ルール数 | フォーカスエリア |
|---------------|---------|-----------------|
| **Next.js** | 20+ルール | サーバー/クライアント境界、ハイドレーション、画像最適化、ルート設定 |
| **React** | 15+ルール | フック使用、コンポーネントパターン、状態管理、アクセシビリティ |
| **Vue** | 10+ルール | Composition API、リアクティビティ、テンプレート構文、コンポーネント通信 |
| **TypeScript** | 12+ルール | 型安全性、インターフェース設計、ジェネリック使用、厳密モード準拠 |

**自然言語での使用**:
```
「Next.jsプロジェクトの潜在的な問題を解析してください」
「このReactコンポーネントのベストプラクティス違反をチェックしてください」
「エラー予測を有効にして静的解析を実行してください」
「これらの特定ファイルのTypeScript問題を解析してください」
```

---

### 5. quick-validate

**目的**: ファイルシステムアクセスなしでコードスニペットを迅速に検証。

**パラメータ**:
```typescript
{
  code: string                     // 検証するコード（必須）
  language?: "typescript"|"javascript"|"jsx"|"tsx"  // コード言語
  framework?: string               // フレームワークコンテキスト
  fileName?: string                // コンテキスト用の任意ファイル名
}
```

**使用例**:

#### TypeScript検証
```typescript
const tsCode = `
const Component = () => {
  const [state, setState] = useState();
  return <div>{state}</div>;
};
`;

const validation = await client.callTool('quick-validate', {
  code: tsCode,
  language: 'tsx',
  framework: 'react'
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `検証結果:

❌ 見つかった問題:
1. 行2: ReactからのuseStateのインポートが不足
2. 行2: useStateフックに型注釈が必要
3. 行3: state変数の型が不足

✅ 提案:
1. 追加: import { useState } from 'react';
2. 変更: const [state, setState] = useState<string>('');
3. より良い型安全性のため適切なTypeScript型を追加
`
  }]
}
```

**検証チェック**:
- **構文エラー**: 無効なJavaScript/TypeScript構文
- **インポート問題**: 不足または不正なインポート
- **フックルール**: Reactフック使用パターン
- **型安全性**: TypeScript型注釈と推論
- **フレームワークパターン**: フレームワーク固有のベストプラクティス
- **パフォーマンス**: パフォーマンスに影響するアンチパターン

**自然言語での使用**:
```
「このReactコンポーネントコードを検証してください」
「このTypeScript関数の問題をチェックしてください」
「このNext.jsページコンポーネントを解析してください」
「このカスタムフック実装を検証してください」
```

---

### 6. realtime-validation

**目的**: フレームワーク固有のルールと任意のウォッチモードでファイルのリアルタイム検証を実行。

**パラメータ**:
```typescript
{
  file: string                     // 検証するファイルパス（必須）
  content?: string                 // ファイルコンテンツ（ディスクから読み取らない場合）
  framework?: string               // ターゲットフレームワーク
  watchMode?: boolean              // 継続的検証を有効化
}
```

**使用例**:

#### 単一ファイル検証
```typescript
const validation = await client.callTool('realtime-validation', {
  file: './src/components/Button.tsx',
  framework: 'react'
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `Button.tsxのリアルタイム検証結果:

✅ ファイル状態: 有効
📊 メトリクス:
• コード行数: 45
• 複雑さスコア: 3 (低)
• 保守性指標: 85 (良好)
• 型カバレッジ: 95%

⚠️ 提案:
1. PropTypesまたはTypeScriptインターフェースでprop検証の追加を検討
2. より良い保守性のためインラインスタイルをstyled-componentsに抽出
`
  }]
}
```

**検証機能**:
- **リアルタイムフィードバック**: 即座の検証結果
- **フレームワーク認識**: コンテキスト固有のルールと提案
- **メトリクス計算**: コード複雑性、保守性、品質スコア
- **パフォーマンス解析**: バンドル影響と最適化機会
- **アクセシビリティチェック**: WCAG準拠とベストプラクティス
- **セキュリティスキャン**: 一般的な脆弱性パターン

**自然言語での使用**:
```
「このコンポーネントファイルをリアルタイムで検証してください」
「ダッシュボードページの現在の状態をチェックしてください」
「継続的検証のためウォッチモードを有効にしてください」
「このファイルの保守性メトリクスを解析してください」
```

---

### 7. get-validation-rules

**目的**: フレームワークとカテゴリ別に整理された利用可能な検証ルールを全て返す。

**パラメータ**: なし

**使用例**:

#### 完全なルール一覧
```typescript
const rules = await client.callTool('get-validation-rules', {});

// 例の応答:
{
  content: [{
    type: "text",
    text: `利用可能な検証ルール:

🏗️ フレームワーク固有のルール:

📱 React (15ルール):
• react-hooks-deps - useEffect依存関係を検証
• react-hooks-order - フックが一貫した順序で呼ばれることを確認
• react-prop-types - コンポーネントプロパティタイプを検証
• react-accessibility - ARIAとセマンティックHTMLをチェック
• react-performance - パフォーマンスアンチパターンを識別

⚡ Next.js (20ルール):
• nextjs-client-server-boundary - サーバー/クライアントコンポーネント検証
• nextjs-hydration-check - ハイドレーションミスマッチを防止
• nextjs-image-optimization - Next.js Imageコンポーネント使用を検証
• nextjs-api-routes - APIルートパターン検証
• nextjs-middleware - ミドルウェア実装チェック

🖖 Vue.js (10ルール):
• vue-composition-api - Composition APIベストプラクティス
• vue-template-syntax - テンプレート構文検証
• vue-reactivity - リアクティブデータパターンチェック
• vue-component-props - プロパティ検証と型付け
• vue-lifecycle - ライフサイクルフック使用パターン

📘 TypeScript (12ルール):
• typescript-strict-mode - 厳密モード準拠
• typescript-type-safety - 型注釈要件
• typescript-generic-usage - ジェネリック型パターン
• typescript-interface-design - インターフェースベストプラクティス

🛡️ セキュリティ (8ルール):
• security-xss-prevention - クロスサイトスクリプティング防止
• security-injection - SQL/コードインジェクション検出
• security-sensitive-data - 機密データ露出チェック
• security-auth-patterns - 認証実装検証

⚡ パフォーマンス (6ルール):
• performance-bundle-size - バンドル最適化チェック
• performance-lazy-loading - 遅延読み込み実装
• performance-memory-leaks - メモリリーク検出
• performance-render-optimization - レンダリングパフォーマンスパターン

♿ アクセシビリティ (10ルール):
• accessibility-aria-labels - ARIAラベル検証
• accessibility-keyboard-nav - キーボードナビゲーションサポート
• accessibility-color-contrast - 色コントラスト準拠
• accessibility-semantic-html - セマンティックHTML使用

総ルール数: 50+
重要度レベル: error、warning、info
自動修正利用可能: 35+ルール
`
  }]
}
```

**ルールカテゴリ**:

| カテゴリ | ルール数 | カバレッジ |
|----------|---------|-----------|
| **フレームワーク固有** | 45+ルール | React、Next.js、Vue.jsパターン |
| **言語** | 12+ルール | TypeScript、JavaScriptベストプラクティス |
| **セキュリティ** | 8+ルール | 一般的な脆弱性と安全なコーディング |
| **パフォーマンス** | 6+ルール | 最適化と効率パターン |
| **アクセシビリティ** | 10+ルール | WCAG準拠とインクルーシブデザイン |

**自然言語での使用**:
```
「利用可能な全ての検証ルールを表示してください」
「React固有のルールはどのようなものがありますか？」
「セキュリティ検証ルールを一覧表示してください」
「サポートされているアクセシビリティチェックは何ですか？」
```

---

## Spike開発ツール

### 8. discover-spikes

**目的**: 自然言語クエリまたはブラウジングに基づいてスパイクテンプレートを発見・一覧表示。

**パラメータ**:
```typescript
{
  query?: string                   // 任意の自然言語クエリ
  limit?: number                   // 結果数の制限
}
```

**使用例**:

#### 自然言語での発見
```typescript
const authSpikes = await client.callTool('discover-spikes', {
  query: 'JWTを使った認証',
  limit: 5
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `🔍 「JWTを使った認証」のスパイク発見結果:

関連テンプレート5件が見つかりました:

1. 🔐 fastapi-jwt-auth
   • 目的: FastAPI用JWT認証
   • スタック: Python、FastAPI、PyJWT、Pydantic
   • 機能: トークン生成、検証、リフレッシュトークン
   • 難易度: 中級

2. 🔐 nextjs-auth-nextauth-credentials
   • 目的: 認証情報を使ったNext.js認証
   • スタック: Next.js、NextAuth.js、JWT
   • 機能: カスタムログイン、セッション管理
   • 難易度: 初級

3. 🔐 nextauth-jwt-provider
   • 目的: JWTプロバイダー付きNextAuth.js
   • スタック: Next.js、NextAuth.js、JWTトークン
   • 機能: カスタムJWT処理、セッションコールバック
   • 難易度: 中級

4. 🔐 express-jwt-auth
   • 目的: Express.js JWT認証
   • スタック: Node.js、Express、jsonwebtoken
   • 機能: ミドルウェア、トークン検証、CORS
   • 難易度: 初級

5. 🔐 fastapi-oauth2-scopes
   • 目的: FastAPI用スコープ付きOAuth2
   • スタック: Python、FastAPI、OAuth2、JWT
   • 機能: スコープベース認可、ロール管理
   • 難易度: 上級

💡 クイックアクション:
• プレビュー: テンプレートIDでpreview-spikeを使用
• 適用: apply-spikeでコード生成
• 説明: explain-spikeで詳細ドキュメント
`
  }]
}
```

**テンプレートカテゴリ**:

| カテゴリ | 数 | 例 |
|----------|-----|---|
| **Webフレームワーク** | 98+ | Next.jsアプリ、Reactコンポーネント、Vueアプリケーション |
| **バックエンドAPI** | 59+ | FastAPIエンドポイント、Expressサーバー、認証 |
| **テスト＆品質** | 58+ | Playwrightテスト、Vitestセットアップ、アクセシビリティテスト |
| **インフラストラクチャ** | 40+ | Dockerコンテナ、CI/CDパイプライン、デプロイメント |
| **UIコンポーネント** | 27+ | コンポーネントライブラリ、デザインシステム |

**自然言語での使用**:
```
「Reactドラッグアンドドロップのテンプレートを見つけてください」
「FastAPIデータベース統合のスパイクを表示してください」
「利用可能なテストテンプレートは何ですか？」
「Next.js認証の例を見つけてください」
```

---

### 9. auto-spike

**目的**: 自然言語要件に基づいて最適なスパイクテンプレートを自動選択し、次のアクションを提案。

**パラメータ**:
```typescript
{
  task: string                     // 自然言語タスク記述（必須）
  constraints?: Record<string, string>  // 解決されたパラメータ
}
```

**使用例**:

#### 自動テンプレート選択
```typescript
const autoSelection = await client.callTool('auto-spike', {
  task: '認証とデータベース付きのNext.jsアプリを作成'
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `🤖 「認証とデータベース付きのNext.jsアプリを作成」の自動スパイク解析

🎯 選択された最適マッチ: nextjs-auth-prisma-complete

📊 選択理由:
• タスク要件: Next.js + 認証 + データベース
• マッチング信頼度: 95%
• テンプレート複雑性: 中級
• 推定セットアップ時間: 15-20分

🏗️ テンプレート詳細:
• フレームワーク: App Router付きNext.js 14
• 認証: 複数プロバイダー対応NextAuth.js
• データベース: PostgreSQL付きPrisma
• UI: shadcn/uiコンポーネント付きTailwind CSS
• 追加: TypeScript、ESLint、Prettier

📋 推奨次ステップ:
1. テンプレートプレビュー: ID「nextjs-auth-prisma-complete」でpreview-spike
2. パラメータカスタマイズ:
   - app_name: your-app-name
   - database_provider: postgresql（またはmysql、sqlite）
   - auth_providers: google,github（または他の組み合わせ）
3. テンプレート適用: apply-spikeでプロジェクト構造生成
4. 環境設定のセットアップ手順に従う

🔗 関連テンプレート:
• nextjs-minimal - よりシンプルなNext.js出発点
• nextjs-auth-nextauth-credentials - 認証のみ
• nextjs-prisma-sqlite-crud - データベース操作フォーカス

💡 プロのヒント: constraintsパラメータを使用してフレームワークバージョンや特定ライブラリなどの正確な要件を指定できます。
`
  }]
}
```

**選択アルゴリズム**:
1. **要件解析**: 技術要件に関する自然言語を解析
2. **テンプレートマッチング**: 機能の整合性に基づいてテンプレートをスコア化
3. **複雑性評価**: 実装難易度を評価
4. **最適適合選択**: 信頼度スコア付きで最適テンプレートを選択
5. **次アクション計画**: 実装の具体的手順を提供

**自然言語での使用**:
```
「リアルタイムメッセージング付きのチャットアプリケーションを構築する必要があります」
「データ視覚化とユーザー管理付きのダッシュボードを作成してください」
「支払い統合付きのeコマースサイトを構築してください」
「Reactコンポーネントライブラリのテストをセットアップしてください」
```

---

### 10. preview-spike

**目的**: 適用前にスパイクテンプレートコンテンツの詳細プレビューを提供。

**パラメータ**:
```typescript
{
  id: string                       // スパイクテンプレートID（必須）
  params?: Record<string, string>  // テンプレートパラメータ
}
```

**使用例**:

#### 基本的なテンプレートプレビュー
```typescript
const preview = await client.callTool('preview-spike', {
  id: 'nextjs-minimal'
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `📋 スパイクテンプレートプレビュー: nextjs-minimal

📝 テンプレート情報:
• 名前: Next.js最小アプリケーション
• バージョン: 1.2.0
• スタック: Next.js 14、React 18、TypeScript、Tailwind CSS
• 難易度: 初級
• セットアップ時間: 約5分

📁 生成されるファイル構造:
my-nextjs-app/
├── 📄 package.json - 依存関係とスクリプト
├── 📄 next.config.js - Next.js設定
├── 📄 tailwind.config.js - Tailwind CSS設定
├── 📄 tsconfig.json - TypeScript設定
├── 📁 app/
│   ├── 📄 layout.tsx - ルートレイアウトコンポーネント
│   ├── 📄 page.tsx - ホームページコンポーネント
│   └── 📄 globals.css - グローバルスタイル
├── 📁 components/
│   └── 📄 ui/ - UIコンポーネントディレクトリ
└── 📄 README.md - セットアップと使用手順

📦 依存関係:
• next: ^14.0.0
• react: ^18.0.0
• typescript: ^5.0.0
• tailwindcss: ^3.3.0
• @types/node: ^20.0.0
• @types/react: ^18.0.0

⚙️ 利用可能パラメータ:
• app_name (デフォルト: "my-nextjs-app") - アプリケーション名
• port (デフォルト: "3000") - 開発サーバーポート
• enable_analytics (デフォルト: "false") - Next.js解析を有効化

🔧 生成されるスクリプト:
• npm run dev - 開発サーバー開始
• npm run build - 本番用ビルド
• npm run start - 本番サーバー開始
• npm run lint - ESLint実行
• npm run type-check - TypeScript検証

📚 含まれる機能:
• App Routerアーキテクチャ
• TypeScript設定
• Tailwind CSSセットアップ
• ESLintとPrettier
• 基本的なコンポーネント構造
• 開発ツール

🚀 適用後の次ステップ:
1. npm installで依存関係をインストール
2. 必要に応じて環境変数を設定
3. npm run devで開発開始
4. アプリケーション機能の構築開始
`
  }]
}
```

**プレビュー情報**:
- **テンプレートメタデータ**: 名前、バージョン、スタック、難易度レベル
- **ファイル構造**: 完全なディレクトリとファイル一覧
- **依存関係**: 必要な全パッケージとバージョン
- **パラメータ**: デフォルト付きの利用可能なカスタマイズオプション
- **機能**: 含まれる機能と能力
- **セットアップ手順**: 適用後の手順と設定

**自然言語での使用**:
```
「Reactテストテンプレートに何が含まれるか表示してください」
「FastAPI認証スパイクをプレビューしてください」
「Next.jsスターターで生成されるファイルは何ですか？」
「Dockerデプロイメントテンプレートの完全な構造を表示してください」
```

---

### 11. apply-spike

**目的**: 競合解決でスパイクテンプレートを適用してファイルとプロジェクト構造を生成。

**パラメータ**:
```typescript
{
  id: string                       // スパイクテンプレートID（必須）
  params?: Record<string, string>  // テンプレートパラメータ
  strategy?: "overwrite"|"three_way_merge"|"abort"  // 競合解決
}
```

**使用例**:

#### 基本的な適用
```typescript
const application = await client.callTool('apply-spike', {
  id: 'nextjs-minimal',
  params: {
    app_name: 'my-awesome-app',
    port: '3001'
  }
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `✅ スパイク適用成功: nextjs-minimal

📁 作成されたプロジェクト構造:
my-awesome-app/
├── ✅ package.json (作成)
├── ✅ next.config.js (作成)
├── ✅ tailwind.config.js (作成)
├── ✅ tsconfig.json (作成)
├── ✅ app/layout.tsx (作成)
├── ✅ app/page.tsx (作成)
├── ✅ app/globals.css (作成)
├── ✅ components/ui/ (ディレクトリ作成)
└── ✅ README.md (作成)

🔧 適用された設定:
• アプリケーション名: my-awesome-app
• 開発ポート: 3001
• TypeScript: 有効
• Tailwind CSS: 設定済み
• ESLint: 設定済み

📋 次ステップ:
1. プロジェクトに移動: cd my-awesome-app
2. 依存関係インストール: npm install
3. 開発開始: npm run dev
4. ブラウザで開く: http://localhost:3001

💡 追加セットアップ:
• 環境変数: .env.exampleを.env.localにコピー
• データベース: データベース使用時はnpm run db:setupを実行
• 認証: auth.config.jsでプロバイダーを設定

🧪 テスト:
• ユニットテスト: npm run test
• E2Eテスト: npm run test:e2e
• 型チェック: npm run type-check
`
  }]
}
```

**競合解決戦略**:

| 戦略 | 動作 | 使用ケース |
|------|-----|----------|
| **overwrite** | 既存ファイルを完全に置換 | クリーンスレート、新規開始 |
| **three_way_merge** | 競合検出付きインテリジェントマージ | 既存プロジェクトの更新 |
| **abort** | 競合が検出されたら停止 | 安全性優先アプローチ |

**生成されるアーティファクト**:
- **ソースファイル**: 完全なアプリケーションコード構造
- **設定**: フレームワークとツール設定
- **ドキュメント**: README、セットアップ手順、使用ガイド
- **スクリプト**: ビルド、テスト、開発、デプロイメントスクリプト
- **依存関係**: 必要な全依存関係を含むPackage.jsonまたは同等ファイル

**自然言語での使用**:
```
「Reactテストテンプレートをプロジェクトに適用してください」
「PostgreSQL付きFastAPIアプリケーションを生成してください」
「認証とデータベース付きNext.jsアプリを作成してください」
「リポジトリ用GitHub Actions CI/CDをセットアップしてください」
```

---

### 12. validate-spike

**目的**: 適用されたスパイクテンプレートの整合性と品質を検証。

**パラメータ**:
```typescript
{
  id: string                       // スパイクテンプレートID（必須）
  params?: Record<string, string>  // 使用されたテンプレートパラメータ
}
```

**使用例**:

#### 適用後検証
```typescript
const validation = await client.callTool('validate-spike', {
  id: 'nextjs-minimal',
  params: {
    app_name: 'my-awesome-app'
  }
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `🔍 スパイク検証結果: nextjs-minimal

✅ 検証サマリー:
• テンプレート整合性: 有効
• ファイル構造: 完全
• 依存関係: 全て解決済み
• 設定: 正しい
• スクリプト: 機能的

📋 詳細チェック:

📁 ファイル構造検証:
✅ package.json - 存在し、有効
✅ next.config.js - 設定正しい
✅ tsconfig.json - TypeScriptセットアップ有効
✅ tailwind.config.js - Tailwind適切に設定
✅ app/layout.tsx - レイアウトコンポーネント有効
✅ app/page.tsx - ページコンポーネント有効
✅ app/globals.css - スタイル適切にインポート

📦 依存関係検証:
✅ next: 14.0.0 (最新安定版)
✅ react: 18.2.0 (互換性あり)
✅ typescript: 5.0.0 (推奨)
✅ tailwindcss: 3.3.0 (最新)
✅ 全てのピア依存関係が満足

⚙️ 設定検証:
✅ TypeScriptパス正しく設定
✅ Tailwind CSS適切に統合
✅ Next.js App Routerセットアップ有効
✅ ESLint設定機能的
✅ ビルドスクリプト適切に定義

🧪 ビルドシステム検証:
✅ npm run build - 正常実行
✅ npm run dev - 開発サーバー開始
✅ npm run lint - リンティング通過
✅ npm run type-check - TypeScriptエラーなし

🎯 テンプレート準拠:
✅ 必要な全ファイル生成
✅ パラメータ置換正しい
✅ ベストプラクティス実装
✅ セキュリティ設定適用

💡 推奨事項:
• 環境変数検証の追加を検討
• コード品質のためpre-commitフックを追加
• より良い整理のため絶対インポートを設定
• コンポーネント開発のためStorybookの追加を検討

🏆 総合スコア: 95/100 (優秀)
`
  }]
}
```

**検証カテゴリ**:

| カテゴリ | チェック | 目的 |
|----------|----------|------|
| **ファイル構造** | 完全性、必須ファイル、ディレクトリ構造 | 必要な全ファイルの存在確認 |
| **依存関係** | バージョン互換性、ピア依存関係、競合 | 依存関係整合性の検証 |
| **設定** | 構文、必須設定、環境変数 | 設定の正当性検証 |
| **ビルドシステム** | スクリプト実行、コンパイル、型チェック | ビルドと開発ワークフローのテスト |
| **テンプレート準拠** | パラメータ置換、ベストプラクティス、セキュリティ | テンプレート標準の確認 |

**自然言語での使用**:
```
「適用されたNext.jsテンプレートを検証してください」
「FastAPIスパイクが正しく適用されたかチェックしてください」
「生成されたプロジェクトの整合性を検証してください」
「適用されたテンプレートの設定をテストしてください」
```

---

### 13. explain-spike

**目的**: スパイクテンプレートの目的、使用法、ベストプラクティスの包括的な説明を提供。

**パラメータ**:
```typescript
{
  id: string                       // スパイクテンプレートID（必須）
}
```

**使用例**:

#### テンプレートドキュメント
```typescript
const explanation = await client.callTool('explain-spike', {
  id: 'nextjs-auth-nextauth-credentials'
});

// 例の応答:
{
  content: [{
    type: "text",
    text: `📚 スパイク説明: nextjs-auth-nextauth-credentials

🎯 目的:
カスタム認証情報プロバイダーを使用したNextAuth.jsによる完全なNext.js認証システムを提供。このテンプレートは、メール/パスワードログイン、セッション管理、保護されたルートによるユーザー認証が必要なアプリケーション向けに設計されています。

🏗️ アーキテクチャ概要:
• フロントエンド: App Router付きNext.js 14
• 認証: 認証情報プロバイダー付きNextAuth.js v4
• セッション: 安全なセッション処理付きJWTトークン
• データベース: NextAuth.jsでサポートされる任意のデータベース対応
• UI: Tailwind CSS付き事前構築済みログイン/登録フォーム

📦 主要コンポーネント:

1. 🔐 認証プロバイダーセットアップ:
   • カスタム認証情報プロバイダー設定
   • メール/パスワード検証ロジック
   • ユーザーセッションコールバック
   • JWTトークンカスタマイズ

2. 🛡️ セキュリティ機能:
   • bcryptjsによるパスワードハッシュ化
   • CSRF保護有効
   • 安全なクッキー設定
   • セッショントークン暗号化

3. 🎨 UIコンポーネント:
   • 検証付きログインフォーム
   • 登録フォーム
   • ユーザープロフィールページ
   • 保護されたルートの例

4. 🔄 セッション管理:
   • サーバーサイドセッション検証
   • クライアントサイドセッションフック
   • 自動トークンリフレッシュ
   • ログアウト機能

📁 ファイル構造詳細:

app/auth/
├── login/page.tsx - フォーム付きログインページ
├── register/page.tsx - 登録ページ
└── profile/page.tsx - 保護されたユーザープロフィール

lib/auth/
├── config.ts - NextAuth.js設定
├── providers.ts - 認証プロバイダー
└── utils.ts - 認証ユーティリティ

components/auth/
├── LoginForm.tsx - 再利用可能ログインコンポーネント
├── RegisterForm.tsx - 登録コンポーネント
└── UserProfile.tsx - ユーザープロフィール表示

middleware.ts - ルート保護ミドルウェア

⚙️ 設定パラメータ:

• app_name (文字列): ブランディング用アプリケーション名
• database_provider (enum): mongodb|postgresql|mysql|sqlite
• enable_registration (ブール値): 新規ユーザー登録を許可
• session_strategy (enum): jwt|database
• secret_key (文字列): 暗号化用NextAuth.jsシークレット
• allowed_domains (配列): メールドメイン制限

🛠️ セットアップ手順:

1. 📋 環境変数:
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   DATABASE_URL=your-database-connection

2. 🗄️ データベースセットアップ:
   • データベースマイグレーション実行
   • usersテーブル作成
   • 接続プーリング設定

3. 🔧 プロバイダー設定:
   • 認証情報検証ロジック更新
   • セッションコールバック設定
   • ユーザー登録フロー設定

📚 ベストプラクティス:

1. 🔐 セキュリティ:
   • 強力でユニークなシークレットキーを使用
   • 認証エンドポイントでレート制限実装
   • 全ユーザー入力を検証・サニタイズ
   • 本番環境ではHTTPS使用

2. 🎨 ユーザーエクスペリエンス:
   • 明確なエラーメッセージ提供
   • ローディング状態実装
   • ログイン状態保持機能追加
   • パスワード強度インジケーター含める

3. 🧪 テスト:
   • 認証フローテスト
   • セッション持続性検証
   • 保護されたルートアクセステスト
   • パスワードリセット機能テスト

4. 📊 監視:
   • 認証試行をログ
   • 失敗ログイン率監視
   • セッション期間追跡
   • 疑わしい活動アラート

🔗 統合例:

1. 保護されたAPIルート:
   import { getServerSession } from 'next-auth';
   
   export async function GET() {
     const session = await getServerSession();
     if (!session) return new Response('Unauthorized', { status: 401 });
     // ... 保護されたロジック
   }

2. クライアントサイド保護:
   import { useSession } from 'next-auth/react';
   
   function ProtectedComponent() {
     const { data: session, status } = useSession();
     if (status === 'loading') return <Loading />;
     if (!session) return <LoginPrompt />;
     return <ProtectedContent />;
   }

🚀 一般的な使用ケース:
• ユーザーアカウント付きSaaSアプリケーション
• 顧客ログイン付きeコマースプラットフォーム
• コンテンツ管理システム
• メンバー限定ウェブサイト
• ダッシュボードアプリケーション

⚠️ 考慮事項:
• データベーススキーマ要件
• 検証のためのメールサービス統合
• パスワードリセットフロー実装
• 多要素認証追加
• ソーシャルログインプロバイダー統合

🔄 拡張ポイント:
• OAuthプロバイダー追加（Google、GitHubなど）
• ロールベースアクセス制御実装
• ユーザープロフィール管理追加
• メール検証含める
• パスワードリセット機能追加

📈 パフォーマンスのヒント:
• スケールに適したセッション戦略使用
• ユーザーデータの適切なキャッシュ実装
• データベースクエリ最適化
• 静的認証アセット用CDN使用

🏆 テンプレート成熟度: 本番対応
📊 複雑性レベル: 中級
⏱️ セットアップ時間: 15-30分
🎯 最適用途: カスタム認証が必要な中〜大規模アプリケーション
`
  }]
}
```

**説明セクション**:

| セクション | 内容 | 目的 |
|------------|------|------|
| **目的** | テンプレートの目標と使用ケース | いつ使用するかの理解 |
| **アーキテクチャ** | 技術スタックと構造 | システム設計概要 |
| **コンポーネント** | 主要ファイルとその役割 | 実装詳細 |
| **設定** | 利用可能パラメータとオプション | カスタマイズガイダンス |
| **セットアップ** | ステップバイステップ実装 | 開始方法 |
| **ベストプラクティス** | 推奨パターンとアプローチ | 品質実装 |
| **統合** | コード例とパターン | 実用的使用法 |
| **拡張** | 可能な拡張と追加 | 将来の開発 |

**自然言語での使用**:
```
「Reactテストテンプレートの仕組みを説明してください」
「FastAPI認証スパイクには何が含まれていますか？」
「Next.jsスターターのベストプラクティスを表示してください」
「Dockerデプロイメントテンプレートの使い方は？」
```

---

## 診断ツール

### 14. self-test

**目的**: MCPサーバー機能を検証するための包括的な自己診断テストを実行。

**パラメータ**: なし

**使用例**:

#### 基本的な自己テスト
```typescript
const selfTest = await client.callTool('self-test', {});

// 例の応答:
{
  content: [{
    type: "text",
    text: "✅ 自己テスト合格"
  }]
}
```

#### 詳細テスト情報
自己テストは内部的に以下の操作を実行します：
1. **カタログアクセス**: 仕様一覧機能をテスト
2. **書き込み操作**: テスト仕様の作成と更新
3. **読み込み操作**: リソースインターフェース経由での仕様取得
4. **フィルタ操作**: フィルタリングされた仕様一覧をテスト
5. **統計**: カタログ統計生成を検証

**テストシナリオ**:
- 空カタログ処理
- 仕様作成と取得
- フィルタ機能検証
- エラーハンドリング検証
- パフォーマンスベースライン測定

**自然言語での使用**:
```
「全てが動作しているかチェックするため自己テストを実行してください」
「MCPサーバー機能をテストしてください」
「Fluorite MCPが動作可能か検証してください」
「サーバーヘルス状態をチェックしてください」
```

---

### 15. performance-test

**目的**: 閾値検証付きMCPサーバーパフォーマンスメトリクスを測定・報告。

**パラメータ**: なし

**使用例**:

#### パフォーマンス測定
```typescript
const perfTest = await client.callTool('performance-test', {});

// 例の応答:
{
  content: [{
    type: "text",
    text: "✅ パフォーマンステスト完了"
  }]
}
```

#### パフォーマンス閾値
パフォーマンステストは以下の閾値に対して検証：
- **list-specs**: 200ms未満の応答時間
- **upsert-spec**: 500ms未満の応答時間
- **spec-resource**: 100ms未満の応答時間

**測定メトリクス**:
- 操作応答時間
- メモリ使用パターン
- スループット能力
- 負荷下でのエラー率
- キャッシュ効果

**パフォーマンスカテゴリ**:

| 操作 | 閾値 | 典型的パフォーマンス | 最適化注記 |
|------|------|-------------------|-----------|
| **List Specs** | 200ms | 約50ms | 初回アクセス後キャッシュ |
| **Upsert Spec** | 500ms | 約100ms | 仕様サイズに依存 |
| **Read Resource** | 100ms | 約10ms | ファイルシステム依存 |
| **Static Analysis** | 10s | 約2s | プロジェクトサイズ依存 |

**自然言語での使用**:
```
「サーバーでパフォーマンステストを実行してください」
「MCP操作がどれくらい速いかチェックしてください」
「サーバー応答時間を測定してください」
「パフォーマンスベンチマークをテストしてください」
```

---

### 16. server-metrics

**目的**: 包括的なサーバー観測性とパフォーマンスメトリクスを表示。

**パラメータ**: なし

**使用例**:

#### メトリクス収集
```typescript
const metrics = await client.callTool('server-metrics', {});

// 例の応答:
{
  content: [{
    type: "text",
    text: `📊 サーバーメトリクス:
{
  "uptime": 3600,
  "operations": {
    "list-specs": {
      "count": 145,
      "avgTime": 23,
      "p95Time": 67,
      "errors": 0
    },
    "upsert-spec": {
      "count": 28,
      "avgTime": 89,
      "p95Time": 234,
      "errors": 1
    },
    "spec-resource": {
      "count": 892,
      "avgTime": 12,
      "p95Time": 34,
      "errors": 3
    }
  },
  "memory": {
    "used": "45MB",
    "heap": "67MB",
    "external": "12MB"
  },
  "cache": {
    "hitRate": 0.85,
    "size": "15MB",
    "entries": 234
  }
}`
  }]
}
```

**メトリクスカテゴリ**:

| カテゴリ | メトリクス | 目的 |
|----------|------------|------|
| **パフォーマンス** | 応答時間、スループット、レイテンシーパーセンタイル | 操作速度監視 |
| **リソース使用** | メモリ、CPU、ディスクI/O | リソース消費追跡 |
| **信頼性** | エラー率、成功率、可用性 | サービスヘルス監視 |
| **キャッシュ** | ヒット率、削除率、メモリ使用 | パフォーマンス最適化 |
| **操作** | リクエスト数、操作分布 | 使用状況分析 |

**監視用途**:
- **本番監視**: デプロイ環境でのサーバーヘルス追跡
- **パフォーマンス調整**: 最適化機会の特定
- **容量計画**: リソース要件の理解
- **デバッグ**: パフォーマンス問題とボトルネックの診断
- **SLA監視**: サービスレベル合意の確保

**自然言語での使用**:
```
「サーバーパフォーマンスメトリクスを表示してください」
「現在のサーバー状態は何ですか？」
「観測性データを表示してください」
「サーバーリソース使用状況をチェックしてください」
```

---

## エラーハンドリング

### 一般的なエラーパターン

#### 仕様が見つからない
```typescript
// エラー応答形式
{
  content: [{
    type: "text",
    text: "仕様 'unknown-lib' が見つかりません。利用可能な仕様: ..."
  }],
  isError: true
}
```

#### 無効なパラメータ
```typescript
// パラメータ検証エラー
{
  content: [{
    type: "text",
    text: "無効なパラメータ: quick-validateには'code'フィールドが必要です"
  }],
  isError: true
}
```

#### ファイルシステムエラー
```typescript
// ファイルアクセスエラー
{
  content: [{
    type: "text",
    text: "仕様読み込みエラー: カタログディレクトリへのアクセス権限が拒否されました"
  }],
  isError: true
}
```

### エラー回復戦略

1. **優雅な劣化**: 機能を減らして操作を継続
2. **自動再試行**: 指数バックオフで失敗操作を再試行
3. **フォールバックオプション**: プライマリ方法が失敗時の代替アプローチ提供
4. **明確なメッセージ**: 推奨解決策付きの詳細エラーメッセージ
5. **コンテキスト保持**: デバッグ用の操作コンテキスト維持

---

## ベストプラクティス

### 関数選択ガイドライン

1. **仕様管理**:
   - 発見とブラウジングには`list-specs`を使用
   - カスタムライブラリ追加には`upsert-spec`を使用
   - 診断と監視には`catalog-stats`を使用

2. **静的解析**:
   - 包括的プロジェクト解析には`static-analysis`を使用
   - 迅速なコードスニペット検証には`quick-validate`を使用
   - ウォッチモード付きアクティブ開発には`realtime-validation`を使用
   - 利用可能チェックの理解には`get-validation-rules`を使用

3. **Spike開発**:
   - テンプレート選択は`discover-spikes`または`auto-spike`から開始
   - テンプレート適用前に`preview-spike`を使用
   - 適切な競合解決で`apply-spike`でテンプレート適用
   - `validate-spike`で結果検証
   - 詳細ドキュメントには`explain-spike`を使用

4. **診断**:
   - 基本ヘルス検証には`self-test`を使用
   - パフォーマンス検証には`performance-test`を使用
   - 詳細監視には`server-metrics`を使用

### パラメータベストプラクティス

1. **必須 vs 任意**: 必須パラメータは常に提供、任意はデフォルトを使用
2. **検証**: APIコール前にクライアントサイドでパラメータ検証
3. **セキュリティ**: ユーザー入力、特にファイルパスとコードコンテンツをサニタイズ
4. **パフォーマンス**: 応答サイズ最適化にフィルタと制限を使用
5. **エラーハンドリング**: 全APIコールに適切なエラーハンドリング実装

### 統合パターン

1. **バッチ操作**: より良いパフォーマンスのため関連操作をグループ化
2. **キャッシュ**: 頻繁にアクセスされる仕様と検証結果をキャッシュ
3. **段階的拡張**: 基本機能から開始、高度な機能を徐々に追加
4. **エラー回復**: 重要な操作のフォールバック戦略実装
5. **監視**: 診断ツールで統合ヘルス監視

---

*関数リファレンス v0.12.1 - 最終更新: 2025年1月*
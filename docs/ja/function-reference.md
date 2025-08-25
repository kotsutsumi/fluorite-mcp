# 関数リファレンス - 包括的ガイド

詳細な例、パラメータ、使用パターンを含むFluorite MCPの全機能の完全なドキュメント。

## 📖 目次

- [MCPツール概要](#mcpツール概要)
- [仕様管理](#仕様管理)
- [静的解析ツール](#静的解析ツール)
- [スパイク開発ツール](#スパイク開発ツール)
- [診断ツール](#診断ツール)
- [エラーハンドリング](#エラーハンドリング)
- [ベストプラクティス](#ベストプラクティス)

## MCPツール概要

Fluorite MCPは4つの主要カテゴリに分類された15の専門ツールを提供します：

| カテゴリ | ツール数 | 目的 |
|----------|----------|------|
| **仕様管理** | 3ツール | ライブラリ仕様とカタログ操作 |
| **静的解析** | 4ツール | コード解析と検証 |
| **スパイク開発** | 6ツール | 高速プロトタイピングとテンプレート |
| **診断** | 3ツール | サーバーヘルスとパフォーマンス監視 |

---

## 仕様管理

### 1. list-specs

**目的**: カタログ内の利用可能なライブラリ仕様を一覧表示（オプションのフィルタリング付き）。

**パラメータ**:
```typescript
{
  filter?: string  // パッケージ名のオプションフィルタパターン
}
```

**使用例**:

#### 基本的な一覧表示
```typescript
// 全仕様を一覧表示
const allSpecs = await client.callTool('list-specs', {});

// 期待されるレスポンス:
{
  content: [{
    type: "text",
    text: "87件の仕様が見つかりました:\n\nshadcn__ui\ntanstack-table\nnextauth\nprisma\n..."
  }]
}
```

#### フィルタ付き一覧表示
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
"利用可能なライブラリ仕様をすべて表示して"
"React関連の仕様を一覧表示"
"どの認証ライブラリが利用可能？"
```

**レスポンス形式**:
- **成功**: マッチするすべての仕様のテキスト一覧
- **空の結果**: 仕様が見つからなかったことを示すメッセージ
- **エラー**: 詳細付きエラーメッセージ

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
name: マイカスタムライブラリ
version: 1.0.0
description: 専門機能のためのカスタムライブラリ
category: custom-tools
homepage: # ライブラリのホームページURL
repository: # GitリポジトリURL
language: TypeScript

features:
  - カスタムデータ処理
  - 型安全API
  - 高性能アルゴリズム

configuration: |
  import { MyLibrary } from 'my-custom-library';
  
  const lib = new MyLibrary({
    apiKey: process.env.API_KEY,
    enableCache: true
  });

best_practices:
  - 常に入力データを検証する
  - より良い型安全性のためにTypeScriptを使用
  - パフォーマンス向上のためキャッシュを有効化
`;

const result = await client.callTool('upsert-spec', {
  pkg: 'my-custom-library',
  yaml: customSpec
});
```

**検証規則**:
- パッケージ名: 1-255文字、英数字とダッシュ/アンダースコア
- YAMLコンテンツ: 有効なYAML構文、最大1MBサイズ
- 必須フィールド: `name`、`description`、`category`

**自然言語での使用**:
```
"カスタム認証ライブラリの仕様を追加"
"React hook formの仕様を新しい例で更新"
"内部UIコンポーネントライブラリの仕様を作成"
```

---

### 3. catalog-stats

**目的**: 仕様カタログに関する包括的な統計を表示。

**パラメータ**: なし

**使用例**:

#### 基本統計
```typescript
const stats = await client.callTool('catalog-stats', {});

// 例のレスポンス:
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
- **ファイル種別**: ファイル拡張子別の内訳（.yaml、.json）
- **最終更新**: 最新変更のタイムスタンプ
- **サイズ情報**: 総カタログサイズと平均仕様サイズ

**自然言語での使用**:
```
"カタログ統計を表示"
"利用可能な仕様はいくつある？"
"ライブラリカタログの現在の状態は？"
```

---

## 静的解析ツール

### 4. static-analysis

**目的**: フレームワーク固有のルールとエラー予測を使った包括的な静的解析を実行。

**パラメータ**:
```typescript
{
  projectPath: string              // プロジェクトルートディレクトリパス（必須）
  targetFiles?: string[]           // 解析する特定ファイル
  framework?: "nextjs"|"react"|"vue"  // 対象フレームワーク
  strictMode?: boolean             // 厳密検証モードを有効化
  maxIssues?: number              // 報告する最大問題数
  enabledRules?: string[]         // 有効にする特定ルール
  disabledRules?: string[]        // 無効にする特定ルール
  autoFix?: boolean               // 自動修正提案を生成
  analyzeDependencies?: boolean   // 依存関係を解析
  predictErrors?: boolean         // エラー予測を有効化
}
```

**使用例**:

#### 基本プロジェクト解析
```typescript
const analysis = await client.callTool('static-analysis', {
  projectPath: '/path/to/my-project',
  framework: 'nextjs',
  predictErrors: true
});

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `静的解析結果:

🔍 解析サマリー:
• 解析されたファイル数: 45
• エラー: 3
• 警告: 12
• 情報: 5

❌ 重要な問題:
1. app/page.tsx:15 - Server ComponentでクライアントフックuseStateが使用されています
   修正: ファイル上部に'use client'ディレクティブを追加

2. components/UserProfile.tsx:23 - ハイドレーションミスマッチの可能性
   修正: クライアント専用操作にはuseEffectを使用

⚠️ 警告:
1. utils/helpers.ts:8 - 未使用のインポート'debounce'
2. components/Button.tsx:45 - アクセシビリティ属性が不足

🔮 エラー予測:
1. HydrationError（85%の確率） - SSRコンポーネント内のDate.now()
2. TypeScriptエラー（72%の確率） - 型注釈の不足
`
  }]
}
```

#### フレームワーク固有解析
```typescript
// Next.js固有解析
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
```

**解析カテゴリ**:

| フレームワーク | ルール数 | 焦点領域 |
|---------------|----------|----------|
| **Next.js** | 20+ルール | サーバー/クライアント境界、ハイドレーション、画像最適化、ルート設定 |
| **React** | 15+ルール | フック使用、コンポーネントパターン、状態管理、アクセシビリティ |
| **Vue** | 10+ルール | Composition API、リアクティビティ、テンプレート構文、コンポーネント通信 |
| **TypeScript** | 12+ルール | 型安全性、インターフェース設計、ジェネリック使用、厳密モード準拠 |

**自然言語での使用**:
```
"Next.jsプロジェクトを潜在的な問題について解析"
"このReactコンポーネントのベストプラクティス違反をチェック"
"エラー予測を有効にして静的解析を実行"
"これらの特定ファイルをTypeScript問題について解析"
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
  fileName?: string                // コンテキスト用のオプションファイル名
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

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `検証結果:

❌ 問題が見つかりました:
1. 2行目: ReactからのuseStateのインポートが不足
2. 2行目: useStateフックに型注釈が必要
3. 3行目: state変数の型が不足

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
- **インポート問題**: 不足または間違ったインポート
- **フックルール**: Reactフック使用パターン
- **型安全性**: TypeScript型注釈と推論
- **フレームワークパターン**: フレームワーク固有のベストプラクティス
- **パフォーマンス**: パフォーマンスに影響するアンチパターン

**自然言語での使用**:
```
"このReactコンポーネントコードを検証"
"このTypeScript関数の問題をチェック"
"このNext.jsページコンポーネントを解析"
"このカスタムフック実装を検証"
```

---

### 6. realtime-validation

**目的**: フレームワーク固有のルールとオプションのウォッチモードでファイルのリアルタイム検証を実行。

**パラメータ**:
```typescript
{
  file: string                     // 検証するファイルパス（必須）
  content?: string                 // ファイルコンテンツ（ディスクから読み込まない場合）
  framework?: string               // 対象フレームワーク
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

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `Button.tsxのリアルタイム検証結果:

✅ ファイル状態: 有効
📊 メトリクス:
• コード行数: 45
• 複雑度スコア: 3（低）
• 保守性指数: 85（良好）
• 型カバレッジ: 95%

⚠️ 提案:
1. PropTypesまたはTypeScriptインターフェースでのprops検証の追加を検討
2. より良い保守性のためインラインスタイルをstyled-componentsに抽出
`
  }]
}
```

**検証機能**:
- **リアルタイムフィードバック**: 即座の検証結果
- **フレームワーク認識**: コンテキスト固有のルールと提案
- **メトリクス計算**: コード複雑度、保守性、品質スコア
- **パフォーマンス解析**: バンドル影響と最適化機会
- **アクセシビリティチェック**: WCAG準拠とベストプラクティス
- **セキュリティスキャン**: 一般的な脆弱性パターン

**自然言語での使用**:
```
"このコンポーネントファイルをリアルタイムで検証"
"ダッシュボードページの現在の状態をチェック"
"継続的検証のためウォッチモードを有効化"
"このファイルの保守性メトリクスを解析"
```

---

### 7. get-validation-rules

**目的**: フレームワークとカテゴリ別に整理された利用可能な検証ルールをすべて返す。

**パラメータ**: なし

**使用例**:

#### 完全ルール一覧
```typescript
const rules = await client.callTool('get-validation-rules', {});

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `利用可能な検証ルール:

🏗️ フレームワーク固有ルール:

📱 React（15ルール）:
• react-hooks-deps - useEffect依存関係を検証
• react-hooks-order - フックの一貫した順序を保証
• react-prop-types - コンポーネントのprop型を検証
• react-accessibility - ARIAとセマンティックHTMLをチェック
• react-performance - パフォーマンスアンチパターンを特定

⚡ Next.js（20ルール）:
• nextjs-client-server-boundary - サーバー/クライアントコンポーネント検証
• nextjs-hydration-check - ハイドレーションミスマッチを防止
• nextjs-image-optimization - Next.js Imageコンポーネント使用を検証
• nextjs-api-routes - APIルートパターン検証
• nextjs-middleware - ミドルウェア実装チェック

🖖 Vue.js（10ルール）:
• vue-composition-api - Composition APIベストプラクティス
• vue-template-syntax - テンプレート構文検証
• vue-reactivity - リアクティブデータパターンチェック
• vue-component-props - Props検証と型付け
• vue-lifecycle - ライフサイクルフック使用パターン

📘 TypeScript（12ルール）:
• typescript-strict-mode - 厳密モード準拠
• typescript-type-safety - 型注釈要件
• typescript-generic-usage - ジェネリック型パターン
• typescript-interface-design - インターフェースベストプラクティス

🛡️ セキュリティ（8ルール）:
• security-xss-prevention - クロスサイトスクリプティング防止
• security-injection - SQL/コードインジェクション検出
• security-sensitive-data - 機密データ露出チェック
• security-auth-patterns - 認証実装検証

⚡ パフォーマンス（6ルール）:
• performance-bundle-size - バンドル最適化チェック
• performance-lazy-loading - 遅延読み込み実装
• performance-memory-leaks - メモリリーク検出
• performance-render-optimization - レンダリングパフォーマンスパターン

♿ アクセシビリティ（10ルール）:
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
|----------|----------|----------|
| **フレームワーク固有** | 45+ルール | React、Next.js、Vue.jsパターン |
| **言語** | 12+ルール | TypeScript、JavaScriptベストプラクティス |
| **セキュリティ** | 8+ルール | 一般的脆弱性とセキュアコーディング |
| **パフォーマンス** | 6+ルール | 最適化と効率パターン |
| **アクセシビリティ** | 10+ルール | WCAG準拠とインクルーシブデザイン |

**自然言語での使用**:
```
"利用可能な検証ルールをすべて表示"
"React固有のルールは何がある？"
"セキュリティ検証ルールを一覧表示"
"サポートされているアクセシビリティチェックは？"
```

---

## スパイク開発ツール

### 8. discover-spikes

**目的**: 自然言語クエリまたはブラウジングに基づいてスパイクテンプレートを発見・一覧表示。

**パラメータ**:
```typescript
{
  query?: string                   // オプションの自然言語クエリ
  limit?: number                   // 結果数の制限
}
```

**使用例**:

#### 自然言語による発見
```typescript
const authSpikes = await client.callTool('discover-spikes', {
  query: 'JWTを使った認証',
  limit: 5
});

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `🔍 「JWTを使った認証」のスパイク発見結果:

5つの関連テンプレートが見つかりました:

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
   • 機能: カスタムJWTハンドリング、セッションコールバック
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
• 説明: explain-spikeで詳細ドキュメントを表示
`
  }]
}
```

**テンプレートカテゴリ**:

| カテゴリ | 数 | 例 |
|----------|----|----|
| **Webフレームワーク** | 98+ | Next.jsアプリ、Reactコンポーネント、Vueアプリケーション |
| **バックエンドAPI** | 59+ | FastAPIエンドポイント、Expressサーバー、認証 |
| **テスト・品質** | 58+ | Playwrightテスト、Vitestセットアップ、アクセシビリティテスト |
| **インフラ** | 40+ | Dockerコンテナ、CI/CDパイプライン、デプロイ |
| **UIコンポーネント** | 27+ | コンポーネントライブラリ、デザインシステム |

**自然言語での使用**:
```
"Reactドラッグ&ドロップのテンプレートを見つけて"
"FastAPIデータベース統合スパイクを表示"
"どのテストテンプレートが利用可能？"
"Next.js認証例を見つけて"
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
  task: '認証とデータベースを持つNext.jsアプリを作成'
});

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `🤖 「認証とデータベースを持つNext.jsアプリを作成」の自動スパイク解析

🎯 最適マッチが選択されました: nextjs-auth-prisma-complete

📊 選択理由:
• タスク要件: Next.js + 認証 + データベース
• マッチ信頼度: 95%
• テンプレート複雑度: 中級
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
3. テンプレート適用: apply-spikeでプロジェクト構造を生成
4. 環境設定のセットアップ手順に従う

🔗 関連テンプレート:
• nextjs-minimal - よりシンプルなNext.js開始点
• nextjs-auth-nextauth-credentials - 認証のみ
• nextjs-prisma-sqlite-crud - データベース操作にフォーカス

💡 プロのヒント: constraintsパラメータを使用してフレームワークバージョンや特定ライブラリなどの正確な要件を指定してください。
`
  }]
}
```

**選択アルゴリズム**:
1. **要件分析**: 技術要件の自然言語解析
2. **テンプレートマッチング**: 機能一致に基づくテンプレートスコアリング
3. **複雑度評価**: 実装難易度の評価
4. **最適フィット選択**: 信頼度スコア付き最適テンプレート選択
5. **次アクション計画**: 実装の具体的ステップ提供

**自然言語での使用**:
```
"リアルタイムメッセージング機能付きチャットアプリを作りたい"
"データ可視化とユーザー管理機能付きダッシュボードを作成"
"決済統合付きECサイトを構築"
"Reactコンポーネントライブラリのテストを設定"
```

---

### 10. preview-spike

**目的**: 適用前にスパイクテンプレートの内容の詳細プレビューを提供。

**パラメータ**:
```typescript
{
  id: string                       // スパイクテンプレートID（必須）
  params?: Record<string, string>  // テンプレートパラメータ
}
```

**使用例**:

#### 基本テンプレートプレビュー
```typescript
const preview = await client.callTool('preview-spike', {
  id: 'nextjs-minimal'
});

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `📋 スパイクテンプレートプレビュー: nextjs-minimal

📝 テンプレート情報:
• 名前: Next.jsミニマルアプリケーション
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
└── 📄 README.md - セットアップと使用方法

📦 依存関係:
• next: ^14.0.0
• react: ^18.0.0
• typescript: ^5.0.0
• tailwindcss: ^3.3.0
• @types/node: ^20.0.0
• @types/react: ^18.0.0

⚙️ 利用可能パラメータ:
• app_name（デフォルト: "my-nextjs-app"） - アプリケーション名
• port（デフォルト: "3000"） - 開発サーバーポート
• enable_analytics（デフォルト: "false"） - Next.js分析を有効化

🔧 生成されるスクリプト:
• npm run dev - 開発サーバー起動
• npm run build - プロダクション用ビルド
• npm run start - プロダクションサーバー起動
• npm run lint - ESLint実行
• npm run type-check - TypeScript検証

📚 含まれる機能:
• App Routerアーキテクチャ
• TypeScript設定
• Tailwind CSSセットアップ
• ESLintとPrettier
• 基本コンポーネント構造
• 開発ツール

🚀 適用後の次ステップ:
1. npm installで依存関係をインストール
2. 必要に応じて環境変数を設定
3. npm run devで開発を開始
4. アプリケーション機能の構築を開始
`
  }]
}
```

**プレビュー情報**:
- **テンプレートメタデータ**: 名前、バージョン、スタック、難易度レベル
- **ファイル構造**: 完全なディレクトリとファイル一覧
- **依存関係**: 必要なパッケージとバージョン
- **パラメータ**: デフォルト付き利用可能カスタマイズオプション
- **機能**: 含まれる機能と能力
- **セットアップ手順**: 適用後のステップと設定

**自然言語での使用**:
```
"Reactテストテンプレートに何が含まれているか表示"
"FastAPI認証スパイクをプレビュー"
"Next.jsスターターで生成されるファイルは？"
"Dockerデプロイテンプレートの完全構造を表示"
```

---

### 11. apply-spike

**目的**: スパイクテンプレートを適用してファイルとプロジェクト構造を生成（競合解決付き）。

**パラメータ**:
```typescript
{
  id: string                       // スパイクテンプレートID（必須）
  params?: Record<string, string>  // テンプレートパラメータ
  strategy?: "overwrite"|"three_way_merge"|"abort"  // 競合解決
}
```

**使用例**:

#### 基本適用
```typescript
const application = await client.callTool('apply-spike', {
  id: 'nextjs-minimal',
  params: {
    app_name: 'my-awesome-app',
    port: '3001'
  }
});

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `✅ スパイクが正常に適用されました: nextjs-minimal

📁 作成されたプロジェクト構造:
my-awesome-app/
├── ✅ package.json（作成）
├── ✅ next.config.js（作成）
├── ✅ tailwind.config.js（作成）
├── ✅ tsconfig.json（作成）
├── ✅ app/layout.tsx（作成）
├── ✅ app/page.tsx（作成）
├── ✅ app/globals.css（作成）
├── ✅ components/ui/（ディレクトリ作成）
└── ✅ README.md（作成）

🔧 適用された設定:
• アプリケーション名: my-awesome-app
• 開発ポート: 3001
• TypeScript: 有効
• Tailwind CSS: 設定済み
• ESLint: 設定済み

📋 次ステップ:
1. プロジェクトに移動: cd my-awesome-app
2. 依存関係をインストール: npm install
3. 開発を開始: npm run dev
4. ブラウザーを開く: http://localhost:3001

💡 追加セットアップ:
• 環境変数: .env.exampleを.env.localにコピー
• データベース: データベース使用時はnpm run db:setupを実行
• 認証: auth.config.jsでプロバイダーを設定

🧪 テスト:
• 単体テスト: npm run test
• E2Eテスト: npm run test:e2e
• 型チェック: npm run type-check
`
  }]
}
```

**競合解決戦略**:

| 戦略 | 動作 | 使用ケース |
|------|------|----------|
| **overwrite** | 既存ファイルを完全に置き換え | クリーンスレート、新規開始 |
| **three_way_merge** | 競合検出付きインテリジェントマージ | 既存プロジェクトの更新 |
| **abort** | 競合検出時に停止 | 安全第一のアプローチ |

**生成される成果物**:
- **ソースファイル**: 完全なアプリケーションコード構造
- **設定**: フレームワークとツール設定
- **ドキュメント**: README、セットアップ手順、使用ガイド
- **スクリプト**: ビルド、テスト、開発、デプロイスクリプト
- **依存関係**: 必要な依存関係すべて付きpackage.jsonまたは同等

**自然言語での使用**:
```
"Reactテストテンプレートをプロジェクトに適用"
"PostgreSQL付きFastAPIアプリケーションを生成"
"認証とデータベース付きNext.jsアプリを作成"
"リポジトリ用GitHub Actions CI/CDを設定"
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

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `🔍 スパイク検証結果: nextjs-minimal

✅ 検証サマリー:
• テンプレート整合性: 有効
• ファイル構造: 完了
• 依存関係: すべて解決
• 設定: 正しい
• スクリプト: 機能的

📋 詳細チェック:

📁 ファイル構造検証:
✅ package.json - 存在し有効
✅ next.config.js - 設定正しい
✅ tsconfig.json - TypeScriptセットアップ有効
✅ tailwind.config.js - Tailwind適切に設定
✅ app/layout.tsx - レイアウトコンポーネント有効
✅ app/page.tsx - ページコンポーネント有効
✅ app/globals.css - スタイル適切にインポート

📦 依存関係検証:
✅ next: 14.0.0（最新安定版）
✅ react: 18.2.0（互換性あり）
✅ typescript: 5.0.0（推奨）
✅ tailwindcss: 3.3.0（最新）
✅ すべてのピア依存関係満足

⚙️ 設定検証:
✅ TypeScriptパス正しく設定
✅ Tailwind CSS適切に統合
✅ Next.js app routerセットアップ有効
✅ ESLint設定機能的
✅ ビルドスクリプト適切に定義

🧪 ビルドシステム検証:
✅ npm run build - 正常実行
✅ npm run dev - 開発サーバー起動
✅ npm run lint - リント通過
✅ npm run type-check - TypeScriptエラーなし

🎯 テンプレート準拠:
✅ 必要ファイルすべて生成
✅ パラメータ置換正しい
✅ ベストプラクティス実装
✅ セキュリティ設定適用

💡 推奨事項:
• 環境変数検証の追加を検討
• コード品質向上のためpre-commitフックを追加
• より良い組織化のため絶対インポートを設定
• コンポーネント開発のためStorybookの追加を検討

🏆 総合スコア: 95/100（優秀）
`
  }]
}
```

**検証カテゴリ**:

| カテゴリ | チェック | 目的 |
|----------|----------|------|
| **ファイル構造** | 完全性、必須ファイル、ディレクトリ構造 | 必要ファイルがすべて存在することを確認 |
| **依存関係** | バージョン互換性、ピア依存関係、競合 | 依存関係整合性を検証 |
| **設定** | 構文、必須設定、環境変数 | 設定の正確性を検証 |
| **ビルドシステム** | スクリプト実行、コンパイル、型チェック | ビルドと開発ワークフローをテスト |
| **テンプレート準拠** | パラメータ置換、ベストプラクティス、セキュリティ | テンプレート標準が満たされていることを確認 |

**自然言語での使用**:
```
"適用されたNext.jsテンプレートを検証"
"FastAPIスパイクが正しく適用されたかチェック"
"生成されたプロジェクトの整合性を確認"
"適用されたテンプレートの設定をテスト"
```

---

### 13. explain-spike

**目的**: スパイクテンプレートの目的、使用方法、ベストプラクティスの包括的説明を提供。

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

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: `📚 スパイク説明: nextjs-auth-nextauth-credentials

🎯 目的:
NextAuth.jsとカスタム認証プロバイダーを使用した完全なNext.js認証システムを提供。このテンプレートは、メール/パスワードログイン、セッション管理、保護されたルートが必要なアプリケーション用に設計されています。

🏗️ アーキテクチャ概要:
• フロントエンド: App Router付きNext.js 14
• 認証: 認証プロバイダー付きNextAuth.js v4
• セッション: セキュアセッション処理付きJWTトークン
• データベース: NextAuth.js対応のあらゆるデータベースと互換
• UI: Tailwind CSSでプリビルドされたログイン/登録フォーム

📦 主要コンポーネント:

1. 🔐 認証プロバイダーセットアップ:
   • カスタム認証プロバイダー設定
   • メール/パスワード検証ロジック
   • ユーザーセッションコールバック
   • JWTトークンカスタマイズ

2. 🛡️ セキュリティ機能:
   • bcryptjsでのパスワードハッシュ
   • CSRF保護有効
   • セキュアCookie設定
   • セッショントークン暗号化

3. 🎨 UIコンポーネント:
   • 検証付きログインフォーム
   • 登録フォーム
   • ユーザープロフィールページ
   • 保護されたルート例

4. 🔄 セッション管理:
   • サーバーサイドセッション検証
   • クライアントサイドセッションフック
   • 自動トークン更新
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

• app_name（文字列）: ブランディング用アプリケーション名
• database_provider（列挙）: mongodb|postgresql|mysql|sqlite
• enable_registration（真偽値）: 新規ユーザー登録を許可
• session_strategy（列挙）: jwt|database
• secret_key（文字列）: 暗号化用NextAuth.jsシークレット
• allowed_domains（配列）: メールドメイン制限

🛠️ セットアップ手順:

1. 📋 環境変数:
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   DATABASE_URL=your-database-connection

2. 🗄️ データベースセットアップ:
   • データベースマイグレーション実行
   • usersテーブル作成
   • 接続プール設定

3. 🔧 プロバイダー設定:
   • 認証検証ロジック更新
   • セッションコールバック設定
   • ユーザー登録フロー設定

📚 ベストプラクティス:

1. 🔐 セキュリティ:
   • 強力でユニークなシークレットキーを使用
   • 認証エンドポイントにレート制限を実装
   • すべてのユーザー入力を検証・サニタイズ
   • プロダクションでHTTPSを使用

2. 🎨 ユーザーエクスペリエンス:
   • 明確なエラーメッセージを提供
   • ローディング状態を実装
   • ログイン記憶機能を追加
   • パスワード強度インジケーターを含める

3. 🧪 テスト:
   • 認証フローをテスト
   • セッション持続性を検証
   • 保護されたルートアクセスをチェック
   • パスワードリセット機能をテスト

4. 📊 監視:
   • 認証試行をログ
   • 失敗ログイン率を監視
   • セッション期間を追跡
   • 疑わしい活動にアラート

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

🚀 一般的使用ケース:
• ユーザーアカウント付きSaaSアプリケーション
• 顧客ログイン付きECプラットフォーム
• コンテンツ管理システム
• メンバー限定ウェブサイト
• ダッシュボードアプリケーション

⚠️ 考慮事項:
• データベーススキーマ要件
• 検証用メールサービス統合
• パスワードリセットフロー実装
• 多要素認証追加
• ソーシャルログインプロバイダー統合

🔄 拡張ポイント:
• OAuthプロバイダー追加（Google、GitHubなど）
• ロールベースアクセス制御実装
• ユーザープロフィール管理追加
• メール検証追加
• パスワードリセット機能追加

📈 パフォーマンスのコツ:
• スケールに適したセッション戦略を使用
• ユーザーデータに適切なキャッシングを実装
• データベースクエリを最適化
• 静的認証アセットにCDNを使用

🏆 テンプレート成熟度: プロダクション対応
📊 複雑度レベル: 中級
⏱️ セットアップ時間: 15-30分
🎯 最適用途: カスタム認証が必要な中〜大規模アプリケーション
`
  }]
}
```

**説明セクション**:

| セクション | 内容 | 目的 |
|-----------|------|------|
| **目的** | テンプレートの目標と使用ケース | いつ使うかの理解 |
| **アーキテクチャ** | 技術スタックと構造 | システム設計概要 |
| **コンポーネント** | 主要ファイルとその役割 | 実装詳細 |
| **設定** | 利用可能パラメータとオプション | カスタマイズガイダンス |
| **セットアップ** | ステップバイステップ実装 | 開始方法 |
| **ベストプラクティス** | 推奨パターンとアプローチ | 品質実装 |
| **統合** | コード例とパターン | 実用的使用 |
| **拡張** | 可能な機能強化と追加 | 将来の開発 |

**自然言語での使用**:
```
"Reactテストテンプレートの動作方法を説明"
"FastAPI認証スパイクには何が含まれている？"
"Next.jsスターターのベストプラクティスを表示"
"Dockerデプロイテンプレートの使用方法は？"
```

---

## 診断ツール

### 14. self-test

**目的**: MCPサーバー機能を検証する包括的自己診断テストを実行。

**パラメータ**: なし

**使用例**:

#### 基本セルフテスト
```typescript
const selfTest = await client.callTool('self-test', {});

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: "✅ セルフテスト合格"
  }]
}
```

**テストシナリオ**:
- 空のカタログ処理
- 仕様作成と取得
- フィルタ機能検証
- エラーハンドリング検証
- パフォーマンスベースライン測定

**自然言語での使用**:
```
"すべて正常に動作しているかセルフテストを実行"
"MCPサーバー機能をテスト"
"Fluorite MCPが動作していることを確認"
"サーバーヘルス状態をチェック"
```

---

### 15. performance-test

**目的**: 閾値検証付きMCPサーバーパフォーマンスメトリクスを測定・報告。

**パラメータ**: なし

**使用例**:

#### パフォーマンス測定
```typescript
const perfTest = await client.callTool('performance-test', {});

// 例のレスポンス:
{
  content: [{
    type: "text",
    text: "✅ パフォーマンステスト完了"
  }]
}
```

**パフォーマンス閾値**:
- **list-specs**: 200ms未満の応答時間
- **upsert-spec**: 500ms未満の応答時間
- **spec-resource**: 100ms未満の応答時間

**測定メトリクス**:
- 操作応答時間
- メモリ使用パターン
- スループット能力
- 負荷下エラー率
- キャッシュ効果

**自然言語での使用**:
```
"サーバーでパフォーマンステストを実行"
"MCP操作の速度をチェック"
"サーバー応答時間を測定"
"パフォーマンスベンチマークをテスト"
```

---

### 16. server-metrics

**目的**: 包括的なサーバー可観測性とパフォーマンスメトリクスを表示。

**パラメータ**: なし

**使用例**:

#### メトリクス収集
```typescript
const metrics = await client.callTool('server-metrics', {});

// 例のレスポンス:
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
|----------|-----------|------|
| **パフォーマンス** | 応答時間、スループット、レイテンシ百分位 | 操作速度監視 |
| **リソース使用** | メモリ、CPU、ディスクI/O | リソース消費追跡 |
| **信頼性** | エラー率、成功率、可用性 | サービスヘルス監視 |
| **キャッシュ** | ヒット率、追い出し率、メモリ使用 | パフォーマンス最適化 |
| **操作** | リクエスト数、操作分布 | 使用分析 |

**自然言語での使用**:
```
"サーバーパフォーマンスメトリクスを表示"
"現在のサーバー状態は？"
"可観測性データを表示"
"サーバーリソース使用量をチェック"
```

---

## エラーハンドリング

### 一般的エラーパターン

#### 仕様が見つからない
```typescript
// エラーレスポンス形式
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

### エラー回復戦略

1. **緩やかな劣化**: 機能を減らして操作を継続
2. **自動再試行**: 指数バックオフで失敗操作を再試行
3. **フォールバックオプション**: 主要方法が失敗時の代替アプローチ提供
4. **明確なメッセージ**: 解決案付き詳細エラーメッセージ
5. **コンテキスト保持**: デバッグ用操作コンテキスト維持

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
   - 利用可能チェック理解には`get-validation-rules`を使用

3. **スパイク開発**:
   - テンプレート選択には`discover-spikes`または`auto-spike`で開始
   - テンプレート適用前に`preview-spike`を使用
   - 適切な競合解決で`apply-spike`でテンプレート適用
   - `validate-spike`で結果を検証
   - 詳細ドキュメントには`explain-spike`を使用

4. **診断**:
   - 基本ヘルス確認には`self-test`を使用
   - パフォーマンス検証には`performance-test`を使用
   - 詳細監視には`server-metrics`を使用

### パラメータベストプラクティス

1. **必須vs任意**: 必須パラメータは常に提供、任意にはデフォルト使用
2. **検証**: API呼び出し前にクライアントサイドでパラメータ検証
3. **セキュリティ**: ユーザー入力、特にファイルパスとコード内容をサニタイズ
4. **パフォーマンス**: レスポンスサイズ最適化にフィルタと制限を使用
5. **エラーハンドリング**: すべてのAPI呼び出しに適切なエラーハンドリングを実装

### 統合パターン

1. **バッチ操作**: より良いパフォーマンスのため関連操作をグループ化
2. **キャッシング**: 頻繁にアクセスされる仕様と検証結果をキャッシュ
3. **段階的改善**: 基本機能から開始、徐々に高度機能を追加
4. **エラー回復**: 重要操作にフォールバック戦略を実装
5. **監視**: 診断ツールで統合ヘルスを監視

---

*関数リファレンス v0.20.0 - 最終更新: 2025年1月*
# スパイクテンプレート開発ガイド

Fluorite MCP の **スパイクテンプレート** システムは、750以上の本番対応の開発スキャフォールドを提供し、アイデアから実装への橋渡しを行います。

## 🎯 概要

スパイクテンプレートは、迅速なプロトタイピングと本番レベルの開発を可能にする、事前構築された、テスト済みのコード構造です。

### 🚀 主要機能

- **750以上のテンプレート**: 認証、API、テスト、デプロイ向けの実戦テスト済みスキャフォールド
- **自然言語インターフェース**: プレーンな日本語で機能を記述
- **インテリジェント選択**: AI駆動のテンプレートマッチング
- **反復改良**: 組み込み品質検証

## 🛠️ カテゴリ別テンプレート

### フロントエンドUI・コンポーネント
- **React/Next.js**: モダンなUIコンポーネントとページ
- **Vue/Nuxt**: リアクティブなコンポーネントとレイアウト
- **Design Systems**: Tailwind CSS、shadcn/ui、Radix UI

### バックエンド・API
- **FastAPI**: Pydantic検証付きRESTful API
- **Node.js/Express**: TypeScript対応のサーバーサイド開発
- **Authentication**: JWT、OAuth、セッション管理

### データベース・ストレージ
- **Prisma ORM**: TypeScript対応のデータベースアクセス
- **Drizzle ORM**: 高性能SQLクエリビルダー
- **Redis**: キャッシュとセッション管理

### テスト・品質保証
- **Jest/Vitest**: 単体テストとテストユーティリティ
- **Playwright**: E2Eテストとブラウザ自動化
- **ESLint/Prettier**: コード品質とフォーマット

### DevOps・デプロイメント
- **Docker**: コンテナ化とデプロイ
- **CI/CD**: GitHub Actions、Vercel、Netlify
- **Monitoring**: ログ、メトリクス、アラート

## 📝 使用方法

### 基本的な使用パターン

```
react-hook-formとzodを使った検証付きのモダンなログインフォームを作成
```

**結果**:
- 適切なライブラリの自動検出
- TypeScript型定義
- アクセシビリティ機能
- セキュリティベストプラクティス

### 高度な使用例

```
NextAuth.jsを使用してGoogleとGitHubプロバイダーでの認証を実装
```

**含まれる内容**:
- プロバイダー設定
- セッション処理
- ミドルウェアセットアップ
- 型定義
- セキュリティ考慮事項

## 🔧 カスタムテンプレート作成

### テンプレート構造

```yaml
name: "custom-template"
description: "カスタムテンプレートの説明"
category: "frontend"
tags: ["react", "typescript", "components"]
files:
  - path: "components/CustomComponent.tsx"
    content: |
      // テンプレートコンテンツ
```

### ベストプラクティス

1. **具体的な命名**: テンプレート名は目的を明確に示す
2. **適切なカテゴリ分け**: 発見しやすいカテゴリに配置
3. **包括的なドキュメント**: 使用方法と例を含める
4. **型安全性**: TypeScript定義を含める
5. **テスト可能性**: テストケースを含める

## 🌟 推奨テンプレート

### 初心者向け
- **React Starter**: 基本的なReactアプリケーション
- **Next.js Starter**: フルスタックNext.jsアプリ
- **Express API**: シンプルなRESTful API

### 中級者向け
- **Auth System**: 完全な認証システム
- **Data Dashboard**: チャートとメトリクス
- **E-commerce**: ショッピングカート機能

### 上級者向け
- **Microservices**: マイクロサービスアーキテクチャ
- **Real-time Chat**: WebSocketチャットアプリ
- **ML Integration**: 機械学習統合

## 📊 品質保証

### 自動検証
- **TypeScript**: 型安全性の確保
- **ESLint**: コード品質チェック
- **Prettier**: 一貫したフォーマット
- **Tests**: 自動テスト実行

### セキュリティ
- **依存関係スキャン**: 脆弱性検出
- **OWASP準拠**: セキュリティベストプラクティス
- **入力検証**: XSS/SQLインジェクション防止

## 🚀 次のステップ

1. **[テンプレート作成ガイド](./template-creation.md)** - カスタムテンプレートの作成方法
2. **[開発者ガイド](./developer.md)** - 高度なカスタマイズ
3. **[APIリファレンス](../API.md)** - 技術詳細

---

*より多くのテンプレートや機能に関する最新情報は、[GitHub リポジトリ](https://github.com/kotsutsumi/fluorite-mcp)をご確認ください。*
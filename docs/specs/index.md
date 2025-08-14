# ライブラリ仕様カタログ

Fluorite MCPが提供するライブラリ仕様の一覧です。これらの仕様はClaude Code CLIにコンテキストを提供し、より正確で実用的なコード生成を可能にします。

::: info
仕様ファイルは `src/catalog/` ディレクトリにYAML形式で保管されています。
:::

## 🌟 特集ライブラリ

### ツリービューコンポーネント
- [React DnD TreeView](./react-dnd-treeview) - ドラッグ&ドロップ対応のツリービュー

## 🖌️ UIコンポーネント & スタイリング

### デザインシステム
- **shadcn/ui** - Radix UIとTailwind CSSを使用したコピー&ペースト可能なコンポーネント
- **@radix-ui/themes** - 完全なデザインシステムとコンポーネントライブラリ
- **Tailwind CSS** - ユーティリティファーストCSSフレームワーク

### ダッシュボード & データ可視化
- **@tremor/react** - React用ダッシュボードコンポーネント
- **Recharts** - D3ベースのコンポーザブルなチャートライブラリ
- **visx** - Airbnb製の低レベル可視化コンポーネント

## 📊 データグリッド & テーブル

- **AG Grid** - エンタープライズグレードのデータグリッド
- **@mui/x-data-grid** - Material-UIの高機能データグリッド
- **@tanstack/react-table** - ヘッドレステーブルライブラリ

## 📝 フォーム & バリデーション

- **react-hook-form** - 高性能フォームライブラリ
- **Zod** - TypeScriptファーストのスキーマ宣言とバリデーション

## 🎯 状態管理

- **Jotai** - React用アトミック状態管理
- **@tanstack/react-query** - 非同期データフェッチとキャッシング

## 🔐 認証 & セキュリティ

- **@auth/nextjs (NextAuth.js)** - Next.js用完全認証ソリューション
- **@clerk/nextjs** - ユーザー管理と認証プラットフォーム
- **Lucia** - シンプルで柔軟な認証ライブラリ

## 🗄️ データベース & ORM

- **Prisma** - 次世代TypeScript ORM
- **Drizzle ORM** - TypeScript SQLクエリビルダー
- **@upstash/redis** - サーバーレスRedisクライアント

## 🌐 フレームワーク & ツール

- **Hono** - 超高速Webフレームワーク
- **tRPC** - エンドツーエンドの型安全API
- **next-intl** - Next.js用国際化ライブラリ

## 🐳 監視 & 分析

- **@sentry/nextjs** - エラー追跡とパフォーマンス監視
- **PostHog** - プロダクト分析プラットフォーム

## 💳 決済 & サブスクリプション

- **Stripe** - オンライン決済処理
- **Paddle** - SaaS向け決済プラットフォーム

## 📤 ファイルアップロード

- **UploadThing** - TypeScript対応ファイルアップロードサービス

---

::: tip 新しい仕様を追加したいですか？
`src/catalog/`ディレクトリにYAMLファイルを追加して、[GitHub](https://github.com/kotsutsumi/fluorite-mcp)でPRを作成してください。
:::

# 使用例とケーススタディ

Fluorite MCP を実際のプロジェクトで活用する具体的な例とケーススタディです。

## 🎯 概要

このガイドでは、様々な開発シナリオにおける Fluorite MCP の活用方法を、実際のコード例とともに紹介します。

## 🌟 基本的な使用例

### 1. React コンポーネント開発

#### シンプルなボタンコンポーネント

**リクエスト例**:
```
shadcn/uiとTailwind CSSを使った再利用可能なボタンコンポーネントを作成
```

**生成される内容**:
```typescript
// components/ui/Button.tsx
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-11 px-8 text-base': size === 'lg',
          },
          className
        )}
        disabled={loading}
        {...props}
      >
        {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
```

#### 高度なフォームコンポーネント

**リクエスト例**:
```
react-hook-form、Zod、shadcn/uiを使った多段階ユーザー登録フォームを作成
```

**特徴**:
- ステップバイステップナビゲーション
- フィールド検証
- プログレスインジケーター
- 条件付きフィールド表示

### 2. API 開発

#### RESTful API エンドポイント

**リクエスト例**:
```
Next.js App RouterでPrisma、JWT認証、Zodバリデーション付きのユーザー管理APIを作成
```

**生成されるファイル構造**:
```
app/api/users/
├── route.ts          # GET, POST /api/users
├── [id]/
│   └── route.ts      # GET, PUT, DELETE /api/users/[id]
├── profile/
│   └── route.ts      # GET, PUT /api/users/profile
└── auth/
    ├── login/
    │   └── route.ts  # POST /api/users/auth/login
    └── register/
        └── route.ts  # POST /api/users/auth/register
```

#### GraphQL API

**リクエスト例**:
```
Apollo ServerとPrismaを使ったGraphQL APIとリアルタイムサブスクリプションを実装
```

**含まれる機能**:
- スキーマ定義
- リゾルバー実装
- リアルタイムサブスクリプション
- 認証・認可
- データローダー

### 3. データベース統合

#### Prisma セットアップ

**リクエスト例**:
```
PostgreSQLとPrismaを使ったeコマースアプリのデータベーススキーマを設計
```

**生成されるスキーマ**:
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  orders    Order[]
  cart      CartItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal
  stock       Int
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]
  cartItems   CartItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  products Product[]
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]
  total     Decimal
  status    OrderStatus @default(PENDING)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

## 🚀 実践的なプロジェクト例

### 1. ブログプラットフォーム

#### プロジェクト概要
- **技術スタック**: Next.js 14, Prisma, NextAuth.js, Tailwind CSS
- **機能**: 記事投稿、コメント、タグ、検索、SEO最適化

#### 実装手順

**1. プロジェクトセットアップ**
```
Next.js 14 App Router、TypeScript、Tailwind CSS、Prismaでブログプラットフォームのベースを作成
```

**2. 認証システム**
```
NextAuth.jsでGoogle、GitHub、メール認証を実装し、ユーザーロール管理を追加
```

**3. コンテンツ管理**
```
MDXとPrismaを使った記事投稿・編集システムをリッチエディターと共に実装
```

**4. SEO最適化**
```
Next.js App Routerのメタデータ機能とサイトマップ生成でSEO最適化を実装
```

### 2. Eコマースプラットフォーム

#### プロジェクト概要
- **技術スタック**: Next.js, Stripe, Prisma, Zustand
- **機能**: 商品カタログ、ショッピングカート、決済、注文管理

#### 実装手順

**1. 商品カタログ**
```
Prisma、Next.js、Tailwind CSSで商品検索・フィルタリング機能付きカタログを作成
```

**2. ショッピングカート**
```
Zustandとローカルストレージを使った永続化対応ショッピングカートを実装
```

**3. 決済システム**
```
Stripe Checkoutと在庫管理を連携した安全な決済システムを構築
```

### 3. リアルタイムチャットアプリ

#### プロジェクト概要
- **技術スタック**: Next.js, Socket.io, Redis, Prisma
- **機能**: リアルタイムメッセージング、ルーム管理、ファイル共有

#### 実装手順

**1. WebSocket接続**
```
Next.js Custom ServerとSocket.ioでリアルタイム通信基盤を構築
```

**2. チャット機能**
```
Redis PubSubとPrismaを使ったスケーラブルなチャットシステムを実装
```

**3. ファイル共有**
```
AWS S3とmultiple uploadを使ったセキュアなファイル共有機能を追加
```

## 🎨 UI/UX 開発例

### 1. ダッシュボード構築

**リクエスト例**:
```
Chart.js、Recharts、Framer Motionを使ったインタラクティブなアナリティクスダッシュボードを作成
```

**含まれるコンポーネント**:
- KPIカード
- 時系列チャート
- 円グラフ・棒グラフ
- データテーブル
- フィルタリング機能

### 2. モバイル対応UI

**リクエスト例**:
```
React Native風のジェスチャー対応モバイルUIをReact、Framer Motion、react-spring で実装
```

**機能**:
- スワイプナビゲーション
- プルトゥリフレッシュ
- 無限スクロール
- タッチジェスチャー

## 🔧 高度な統合例

### 1. 機械学習統合

**リクエスト例**:
```
TensorFlow.js、OpenAI API、Hugging Faceを使った画像認識・テキスト生成機能を統合
```

**実装内容**:
- 画像アップロード・認識
- テキスト生成・要約
- リアルタイム予測
- モデル管理

### 2. マイクロサービス

**リクエスト例**:
```
Docker、Kubernetes、gRPCでマイクロサービスアーキテクチャを構築
```

**サービス構成**:
- ユーザーサービス
- 商品サービス
- 注文サービス
- 通知サービス
- APIゲートウェイ

### 3. PWA 開発

**リクエスト例**:
```
Next.js PWAでオフライン対応、プッシュ通知、バックグラウンド同期を実装
```

**PWA機能**:
- サービスワーカー
- キャッシュ戦略
- オフライン機能
- プッシュ通知

## 📊 パフォーマンス最適化例

### 1. 画像最適化

**リクエスト例**:
```
Next.js Image、Sharp、CDNを使った画像最適化システムを実装
```

**最適化技術**:
- 自動リサイズ
- WebP変換
- 遅延読み込み
- CDN配信

### 2. コード分割

**リクエスト例**:
```
React.lazy、Suspense、dynamic importでコード分割と最適化を実装
```

**分割戦略**:
- ルートベース分割
- コンポーネント分割
- ライブラリ分割
- 条件付き読み込み

## 🧪 テスト戦略

### 1. 包括的テストスイート

**リクエスト例**:
```
Jest、Testing Library、Playwright、MSWで完全なテストスイートを構築
```

**テストタイプ**:
- 単体テスト
- 統合テスト
- E2Eテスト
- ビジュアルリグレッションテスト

### 2. テスト自動化

**リクエスト例**:
```
GitHub Actions、Docker、TestContainersでCI/CDテストパイプラインを構築
```

**自動化機能**:
- プルリクエストテスト
- 並列テスト実行
- テストレポート生成
- カバレッジ追跡

## 🚀 デプロイメント例

### 1. Vercel デプロイ

**リクエスト例**:
```
Vercel、PlanetScale、Upstashで本番環境デプロイメントを設定
```

**設定内容**:
- 環境変数管理
- プレビューデプロイ
- ドメイン設定
- 監視・ログ

### 2. AWS デプロイ

**リクエスト例**:
```
AWS ECS、RDS、CloudFront、Route53でスケーラブルな本番環境を構築
```

**インフラ構成**:
- コンテナオーケストレーション
- データベースクラスタ
- CDN・DNS
- 監視・ログ

## 📈 ケーススタディ

### ケース1: スタートアップのMVP開発

**課題**: 3ヶ月でSaaSプロダクトのMVPを開発
**解決策**: Fluorite MCPでテンプレート活用、開発期間50%短縮
**技術**: Next.js, Supabase, Stripe, Vercel

### ケース2: 既存システムのモダン化

**課題**: レガシーPHPアプリケーションのReact移行
**解決策**: 段階的移行とAPIファースト設計
**技術**: React, FastAPI, PostgreSQL, Docker

### ケース3: 大規模Eコマースサイト

**課題**: 高トラフィック対応とパフォーマンス最適化
**解決策**: マイクロサービス化とCDN活用
**技術**: Next.js, Kubernetes, Redis, AWS

## 💡 成功のポイント

### 1. 段階的開発
- 小さな機能から始める
- 段階的に機能を追加
- 継続的なテストと改善

### 2. 適切な技術選択
- プロジェクト要件に合致
- チームのスキルレベル考慮
- 長期保守性を重視

### 3. コミュニティ活用
- ベストプラクティスの学習
- 問題解決のサポート
- 継続的な情報収集

## 🎯 次のアクション

1. **プロジェクト開始**: 興味のあるプロジェクトを選択
2. **段階的実装**: 小さな機能から始める
3. **継続的学習**: 新しい技術を積極的に試す
4. **コミュニティ参加**: 質問や貢献を通じて成長

---

**質問やサポートが必要ですか？** [GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions) でコミュニティと交流しましょう！
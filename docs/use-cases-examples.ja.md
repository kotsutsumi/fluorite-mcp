# 実世界の使用例と統合事例

様々な開発環境、チーム構造、プロジェクト規模でのFluorite MCPの実用的で本番レディな統合シナリオの包括的なコレクション。

## 📖 目次

- [開発チームワークフロー](#開発チームワークフロー)
- [CI/CD統合パターン](#cicd統合パターン)
- [IDEとエディタ統合](#ideとエディタ統合)
- [大規模プロジェクト管理](#大規模プロジェクト管理)
- [チーム間コラボレーション](#チーム間コラボレーション)
- [本番デプロイメントシナリオ](#本番デプロイメントシナリオ)
- [実世界の問題のトラブルシューティング](#実世界の問題のトラブルシューティング)

---

## 開発チームワークフロー

### スタートアップチーム: 迅速なMVP開発

**シナリオ**: 3人のスタートアップがSaaSプラットフォームを構築し、アイデアから4週間でMVPを作成する必要がある。

**チーム構成**:
- 1人のフルスタック開発者（React/Node.js）
- 1人のバックエンド開発者（Python/FastAPI）
- 1人のプロダクトマネージャー（技術的）

#### セットアップと設定

```bash
# チームセットアップスクリプト
#!/bin/bash
echo "🚀 スタートアップチーム用Fluorite MCPをセットアップ中..."

# 各チームメンバーにFluorite MCPをインストール
npm install -g fluorite-mcp

# Claude Code CLIに追加
claude mcp add fluorite -- fluorite-mcp-server

# チーム設定を作成
mkdir -p .fluorite
cat > .fluorite/team-config.yml << EOF
team:
  name: "StartupMVP"
  size: "small"
  stage: "mvp"
  
frameworks:
  primary: ["nextjs", "fastapi"]
  experimental: ["supabase", "vercel"]
  
quality_gates:
  error_threshold: 2  # 迅速な開発中はいくつかのエラーを許可
  warning_threshold: 10
  mvp_mode: true
  
spike_preferences:
  favor_minimal: true
  prioritize_speed: true
  include_auth: true
  include_database: true
EOF

echo "✅ チームセットアップ完了!"
```

#### 日常の開発ワークフロー

**朝のスタンドアップ統合**:
```bash
# Fluoriteを使ったスプリント計画
echo "📋 今日の開発目標:"
echo "1. ユーザー認証システム"
echo "2. データ可視化を含む基本ダッシュボード"
echo "3. APIレート制限"

# スパイク推奨事項の自動生成
claude-code "以下の実装計画を生成:"
claude-code "1. Supabase認証付きNext.jsアプリ"
claude-code "2. JWT付きFastAPIバックエンド"
claude-code "3. チャート付きReactダッシュボード"
```

**実際の実装例**:

```bash
# フロントエンド開発者の朝の作業
claude-code "Next.js、Supabase認証、Rechartsを使用して、認証、データテーブル、チャートを含むユーザーダッシュボードを作成"

# 期待される出力:
# ✅ テンプレート選択: nextjs-supabase-auth
# ✅ テンプレート選択: tanstack-table-react-minimal  
# ✅ テンプレート選択: recharts integration
# 📦 作成されたファイル:
#   - app/dashboard/page.tsx
#   - app/auth/login/page.tsx
#   - components/DataTable.tsx
#   - components/ChartContainer.tsx
#   - lib/supabase.ts
#   - middleware.ts (認証保護)
```

```bash
# バックエンド開発者のワークフロー
claude-code "JWT認証、PostgreSQLデータベース、メール通知用バックグラウンドタスク、レート制限を含むFastAPIをセットアップ"

# 期待される出力:
# ✅ 適用されたテンプレート:
#   - fastapi-jwt-auth
#   - fastapi-sqlalchemy-postgres
#   - fastapi-background-tasks
#   - fastapi-rate-limit-minimal
# 📦 完全なAPI構造が作成されました
# 🔧 データベースモデルとマイグレーションの準備完了
# 📧 メール通知システムが設定されました
```

### エンタープライズチーム: 大規模開発

**シナリオ**: 20人以上の開発者を持つ大企業で、マイクロサービスアーキテクチャとDevOpsプラクティスが必要。

**チーム構成**:
- フロントエンドチーム（8人）
- バックエンドチーム（10人）
- DevOps/インフラチーム（3人）
- QAチーム（2人）

#### エンタープライズ設定

```yaml
# .fluorite/enterprise-config.yml
enterprise:
  name: "LargeCorpPlatform"
  teams:
    - name: "frontend"
      size: 8
      primary_stack: ["react", "typescript", "next.js"]
      quality_level: "strict"
    - name: "backend"
      size: 10
      primary_stack: ["node.js", "fastapi", "java"]
      quality_level: "enterprise"
    - name: "devops"
      size: 3
      primary_stack: ["kubernetes", "terraform", "aws"]
      quality_level: "production"

quality_gates:
  code_coverage: 90
  security_scan: true
  performance_budget: true
  accessibility_compliance: "WCAG-AA"

governance:
  require_pr_review: true
  enforce_conventional_commits: true
  automated_testing: "mandatory"
  security_scanning: "pre-commit"

standards:
  typescript_strict: true
  eslint_config: "@company/eslint-config"
  prettier_config: "@company/prettier-config"
```

## プロジェクト別使用例

### 🛒 Eコマースプラットフォーム

**要件**: ユーザー認証、商品カタログ、ショッピングカート、決済処理

```bash
claude-code "Eコマースプラットフォームを作成 - Next.js、Stripe決済、商品管理、ユーザー認証、管理ダッシュボード"

# 生成されるコンポーネント:
# 📦 商品カタログ（検索・フィルタリング付き）
# 🛒 ショッピングカート機能
# 💳 Stripe決済統合
# 👤 ユーザー認証（NextAuth.js）
# 📊 管理者ダッシュボード
# 📱 レスポンシブデザイン
```

### 🏥 ヘルスケアダッシュボード

**要件**: 患者データ、医師スケジュール、レポート生成、HIPAA準拠

```bash
claude-code "HIPAA準拠のヘルスケアダッシュボード - 患者管理、予約システム、医療記録、セキュアな認証"

# セキュリティ機能:
# 🔒 エンドツーエンド暗号化
# 🏥 HIPAA準拠データ処理
# 👨‍⚕️ 役割ベースアクセス制御
# 📋 監査ログ
# 🔐 二要素認証
```

### 🏦 FinTechアプリケーション

**要件**: 金融取引、リアルタイムデータ、規制遵守、高可用性

```bash
claude-code "FinTechアプリ - リアルタイム取引、KYC/AML、暗号化、監査ログ、高可用性アーキテクチャ"

# 金融機能:
# 💰 リアルタイム取引処理
# 📊 ポートフォリオ管理
# 🔍 KYC/AML統合
# 📈 リアルタイムチャート
# 🔐 銀行レベルセキュリティ
```

## チーム規模別ワークフロー

### 👤 個人開発者

```bash
# 個人プロジェクト用シンプル設定
claude-code setup --personal
claude-code "個人ブログ - Next.js、Markdown、SEO最適化、Vercelデプロイ"

# 推奨ワークフロー:
# 1. アイデア → スパイクテンプレート
# 2. 迅速プロトタイピング
# 3. 段階的機能追加
# 4. 自動デプロイメント
```

### 👥 小規模チーム（2-5人）

```bash
# 小規模チーム用共有設定
fluorite-mcp init --team-size small
fluorite-mcp configure --shared-standards

# チームワークフロー:
# 📝 共有コーディング標準
# 🔄 自動コードレビュー
# 🧪 継続的テスト
# 🚀 共有デプロイメント
```

### 🏢 中規模チーム（6-20人）

```bash
# 中規模チーム用構造化設定
fluorite-mcp init --team-size medium
fluorite-mcp configure --governance-mode

# チーム機能:
# 📋 プロジェクト管理統合
# 👥 チーム間協調
# 📊 品質メトリクス
# 🔍 コード分析
```

## 統合パターン

### GitHub Actions統合

```yaml
# .github/workflows/fluorite-quality.yml
name: Fluorite Quality Check
on: [push, pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Fluorite MCP
        run: npm install -g fluorite-mcp
      - name: Run Code Analysis
        run: |
          fluorite-mcp analyze --format github-actions
          fluorite-mcp validate --strict
      - name: Generate Quality Report
        run: fluorite-mcp report --output quality-report.md
```

### Docker統合

```dockerfile
# Dockerfile.development
FROM node:18-alpine
RUN npm install -g fluorite-mcp claude-code
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN fluorite-mcp setup --docker-mode
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### VS Code統合

```json
{
  "fluorite.autoActivate": true,
  "fluorite.suggestions": "aggressive",
  "fluorite.qualityGates": true,
  "fluorite.realtimeValidation": true,
  "fluorite.teamSync": true
}
```

## パフォーマンス最適化

### ローカル開発

```bash
# 高速ローカル開発
export FLUORITE_CACHE_DIR="/tmp/fluorite-cache"
export FLUORITE_PARALLEL_ANALYSIS=true
export FLUORITE_QUICK_MODE=true

# パフォーマンス設定
fluorite-mcp configure --performance-mode aggressive
fluorite-mcp cache --preload common-templates
```

### CI/CD最適化

```bash
# CI用最適化
fluorite-mcp configure --ci-mode
fluorite-mcp cache --ci-friendly
fluorite-mcp analyze --parallel --fast-fail
```

## トラブルシューティング

### 一般的な問題と解決策

**問題: テンプレートが見つからない**
```bash
# キャッシュをクリア
fluorite-mcp cache --clear
fluorite-mcp templates --refresh

# カスタムテンプレートディレクトリを確認
fluorite-mcp config --template-dirs
```

**問題: パフォーマンスが遅い**
```bash
# 診断実行
fluorite-mcp diagnose --performance
fluorite-mcp optimize --auto-tune

# 詳細な分析
fluorite-mcp profile --detailed
```

**問題: 品質ゲートの失敗**
```bash
# 詳細なエラー表示
fluorite-mcp validate --verbose --explain

# ルールの調整
fluorite-mcp rules --customize --team-specific
```

## 高度な使用例

### マルチプロジェクト管理

```yaml
# workspace-config.yml
workspace:
  projects:
    - name: "frontend-app"
      path: "./apps/frontend"
      framework: "next.js"
      team: "frontend"
    - name: "backend-api"
      path: "./services/api"
      framework: "fastapi"
      team: "backend"
    - name: "mobile-app"
      path: "./apps/mobile"
      framework: "react-native"
      team: "mobile"

shared_dependencies:
  - typescript
  - eslint
  - prettier

cross_project_validation: true
```

### カスタムワークフロー

```typescript
// scripts/custom-workflow.ts
import { FluoriteWorkflow } from 'fluorite-mcp/workflow';

const customWorkflow = new FluoriteWorkflow()
  .addStep('analysis', { 
    action: 'analyze',
    scope: 'all',
    quality_gates: true
  })
  .addStep('generation', {
    action: 'generate',
    templates: 'auto-detect',
    apply_standards: true
  })
  .addStep('validation', {
    action: 'validate',
    strict_mode: true,
    team_rules: true
  })
  .addStep('deployment', {
    action: 'deploy',
    environment: 'staging',
    run_tests: true
  });

await customWorkflow.execute();
```

## まとめ

Fluorite MCPは様々な開発シナリオに対応する柔軟で強力なツールです。小規模な個人プロジェクトから大規模なエンタープライズアプリケーションまで、チームの生産性と品質を向上させることができます。

詳細な設定とカスタマイズについては、[統合ガイド](./integration-guide.ja.md)と[パフォーマンスガイド](./performance.ja.md)を参照してください。
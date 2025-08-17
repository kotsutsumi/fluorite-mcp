# スパイクテンプレート拡張計画

## 現状
- **既存テンプレート**: 55テンプレート
- **カバレッジ**: FastAPI, Next.js, GitHub Actions, Playwright
- **構造**: id、メタデータ、params、files、patches を含む JSON 形式

## 目標状態
- **目標**: 一般的な開発パターンの80%をカバーする1000+テンプレート
- **タイムライン**: 3ヶ月
- **アプローチ**: カテゴリベースの系統的拡張

## テンプレートカテゴリと優先順位

### 優先度1: コアWebフレームワーク（200テンプレート）

#### React エコシステム（50テンプレート）
```
react-minimal
react-router-basic
react-context-api
react-redux-setup
react-mobx-setup
react-query-setup
react-hook-form
react-table-basic
react-virtualized-list
react-error-boundary
react-suspense-lazy
react-portal-modal
react-custom-hooks
react-testing-library
react-storybook
```

#### Vue.js エコシステム（40テンプレート）
```
vue3-minimal
vue3-composition-api
vue3-pinia-store
vue3-router-setup
vue3-i18n
vue3-form-validation
vue3-component-library
vue3-nuxt-setup
vue3-vite-config
vue3-testing
```

#### Angular エコシステム（30テンプレート）
```
angular-minimal
angular-routing
angular-forms-reactive
angular-http-interceptor
angular-guards
angular-services
angular-ngrx-store
angular-material-setup
angular-testing-karma
angular-testing-jest
```

#### バックエンドフレームワーク（80テンプレート）
```
# Node.js/Express
express-minimal
express-middleware-auth
express-mongodb-setup
express-postgresql-setup
express-redis-cache
express-websocket
express-graphql
express-rest-api

# Python/Django
django-minimal
django-rest-framework
django-celery-setup
django-channels-websocket
django-admin-custom
django-testing

# Ruby on Rails
rails-minimal
rails-api-only
rails-devise-auth
rails-sidekiq-jobs
rails-action-cable
```

### 優先度2: データベース・ORM テンプレート（150テンプレート）

#### SQL データベース（50テンプレート）
```
postgres-connection
postgres-migrations
mysql-connection
sqlite-setup
sql-server-connection
```

#### NoSQL データベース（30テンプレート）
```
mongodb-connection
mongodb-aggregation
redis-cache-setup
elasticsearch-client
cassandra-setup
```

#### ORM とクエリビルダー（70テンプレート）
```
prisma-setup
prisma-migrations
prisma-relations
drizzle-orm-setup
sequelize-setup
typeorm-setup
mongoose-schema
```

### 優先度3: 認証・セキュリティ（100テンプレート）

#### 認証（50テンプレート）
```
jwt-auth-basic
oauth2-google
oauth2-github
auth0-integration
firebase-auth
supabase-auth
clerk-auth
nextauth-setup
passport-strategies
```

#### セキュリティ（50テンプレート）
```
cors-setup
helmet-config
rate-limiting
csrf-protection
xss-prevention
sql-injection-prevention
api-key-management
secrets-management
```

### 優先度4: テストテンプレート（100テンプレート）

#### ユニットテスト（40テンプレート）
```
jest-setup
vitest-setup
mocha-chai
pytest-setup
rspec-setup
junit-setup
```

#### 統合テスト（30テンプレート）
```
supertest-api
playwright-e2e
cypress-setup
selenium-grid
testcafe-setup
```

#### パフォーマンステスト（30テンプレート）
```
k6-load-testing
jmeter-setup
artillery-config
lighthouse-ci
```

### 優先度5: DevOps・CI/CD（150テンプレート）

#### Docker（40テンプレート）
```
dockerfile-node
dockerfile-python
docker-compose-fullstack
docker-multi-stage
docker-healthcheck
```

#### Kubernetes（40テンプレート）
```
k8s-deployment
k8s-service
k8s-ingress
k8s-configmap
k8s-secrets
helm-chart-basic
```

#### CI/CD パイプライン（70テンプレート）
```
github-actions-deploy
gitlab-ci-pipeline
jenkins-pipeline
azure-devops
circleci-config
travis-ci
```

### 優先度6: クラウドサービス（100テンプレート）

#### AWS（40テンプレート）
```
aws-lambda-function
aws-s3-upload
aws-dynamodb-client
aws-sqs-queue
aws-sns-topic
aws-cognito-auth
```

#### Azure（30テンプレート）
```
azure-functions
azure-blob-storage
azure-cosmos-db
azure-service-bus
```

#### Google Cloud（30テンプレート）
```
gcp-cloud-functions
gcp-firestore
gcp-pubsub
gcp-cloud-run
```

### 優先度7: モバイル開発（100テンプレート）

#### React Native（40テンプレート）
```
react-native-minimal
react-native-navigation
react-native-expo
react-native-firebase
```

#### Flutter（40テンプレート）
```
flutter-minimal
flutter-bloc-pattern
flutter-provider
flutter-firebase
```

#### ネイティブ（20テンプレート）
```
swift-ui-basic
kotlin-android-basic
```

### 優先度8: 専門テンプレート（100テンプレート）

#### AI/ML（30テンプレート）
```
openai-integration
langchain-setup
tensorflow-basic
pytorch-minimal
```

#### リアルタイム（30テンプレート）
```
websocket-server
socket-io-setup
webrtc-basic
server-sent-events
```

#### マイクロサービス（40テンプレート）
```
grpc-service
graphql-federation
message-queue-setup
service-mesh-config
```

## テンプレート生成戦略

### 自動生成
```typescript
// src/cli/templates/generator.ts
export class TemplateGenerator {
  async generateFromExisting(source: string): Promise<Template> {
    // 既存コードベースの分析
    // パターンの抽出
    // テンプレートの生成
  }
  
  async generateVariations(base: Template): Promise<Template[]> {
    // 以下の異なる組み合わせでバリエーションを作成:
    // - データベース
    // - 認証方法
    // - テストフレームワーク
    // - デプロイ先
  }
}
```

### テンプレート検証
```typescript
// src/cli/templates/validator.ts
export class TemplateValidator {
  async validate(template: Template): Promise<ValidationResult> {
    // 構文チェック
    // 依存関係の検証
    // 生成テスト
    // ベストプラクティスの確認
  }
}
```

### テンプレートインデックス作成
```typescript
// src/cli/templates/indexer.ts
export class TemplateIndexer {
  async index(templates: Template[]): Promise<Index> {
    // 検索可能なインデックスを作成
    // タグとカテゴリを追加
    // 依存関係グラフを構築
    // 推奨事項を生成
  }
}
```

## 実装タイムライン

### 1ヶ月目: 基盤・コアテンプレート
- 第1-2週: テンプレート生成システムの構築
- 第3-4週: 200のコアWebフレームワークテンプレートの作成

### 2ヶ月目: 拡張
- 第5-6週: 150のデータベース・ORMテンプレートの追加
- 第7-8週: 100の認証・セキュリティテンプレートの追加

### 3ヶ月目: 完成
- 第9-10週: 100のテストテンプレートの追加
- 第11-12週: 残りのカテゴリの追加

## 品質指標

### テンプレート品質スコア
```
品質スコア = (完全性 * 0.3) + 
             (ベストプラクティス * 0.3) + 
             (ドキュメント * 0.2) + 
             (テスト * 0.2)
```

### カバレッジ指標
- フレームワークカバレッジ: 人気フレームワークの80%
- パターンカバレッジ: 一般的なパターンの90%
- ユースケースカバレッジ: 典型的なシナリオの85%

## テンプレートメタデータスキーマ

```json
{
  "id": "template-id",
  "name": "人が読める名前",
  "version": "1.0.0",
  "category": "web-framework",
  "subcategory": "react",
  "stack": ["node", "react", "typescript"],
  "tags": ["frontend", "spa", "hooks"],
  "description": "詳細な説明",
  "author": "貢献者名",
  "created": "2024-01-15",
  "updated": "2024-01-15",
  "downloads": 0,
  "rating": 0,
  "complexity": "beginner|intermediate|advanced",
  "timeToImplement": "5min",
  "dependencies": {
    "required": ["node>=18"],
    "optional": ["docker"]
  },
  "params": [],
  "files": [],
  "patches": [],
  "postInstall": {
    "commands": ["npm install"],
    "instructions": "次のステップ..."
  }
}
```

## 成功指標

1. **テンプレート数**: 1000+テンプレート
2. **カバレッジ**: 一般的なパターンの80%
3. **品質スコア**: 平均 > 4.5/5
4. **使用率**: 70%のテンプレートが月次で使用される
5. **生成時間**: テンプレートあたり < 2秒
6. **検索精度**: 95%の関連性のある結果
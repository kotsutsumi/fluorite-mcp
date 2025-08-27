## パック別 検証チェックリスト（実務向け）

スパイク適用後に最低限確認すべき観点を、パック単位で整理しました。詳細な一般チェックは `docs/post-apply-checklists.md` と `docs/verification-examples.md` を併用してください。

### Search（Elasticsearch / OpenSearch / MeiliSearch / Typesense / Algolia）
- 環境変数: 接続先URL/APIキー/認証方式（.envとSecret Managerの住み分け）
- 権限: インデックス作成/更新/検索の IAM/ロール/ACL
- スキーマ: マッピング/スキーマ不一致時のfallback（strict/lenient）
- 書き込み: `indexDoc()` の成功/失敗（400/401/429/5xx）
- 運用: バックグラウンドの再試行、バルク投入、idempotency

### Storage（S3 / GCS / Azure Blob / MinIO / Cloudinary / UploadThing）
- 資格情報: 取得元（環境/ランタイムプロファイル/ワークロードID）と権限最小化
- バケット/コンテナ: ライフサイクル、バージョニング、リージョン、CORS
- 署名URL: 有効期限、範囲、ヘッダ（Content-Type/Disposition）
- 大容量: マルチパートや再開、整合性（ETag）
- ログ/監査: 監査証跡、削除保護（WORM/Retention）

### Monitoring（Sentry / PostHog / Datadog / NewRelic / Prometheus / Pino / Winston）
- SDK初期化: DSN/APIキー、非同期送信の安全停止（flush/timeout）
- サンプリング: エラー/トレース/ログのサンプリング比率とPIIマスク
- 可観測性: メトリクス/ログ/トレースの相関（trace_id/span_id）
- アラート: しきい値/SLO/通知先（Slack/メール/On-call）
- パフォーマンス: 低負荷/高負荷でのオーバーヘッド計測

### Payments（Stripe / Paddle / PayPal / Braintree）
- Webhook: 署名検証（失敗時400）、リトライ/冪等性（Idempotency-Key）
- エラー分類: 一時失敗/恒久失敗の分離とDLQ方針
- セキュリティ: 公開キー/秘密キーの分離、最小権限
- ログ/監査: 監査証跡、重要イベントの追跡（Refund/Chargeback）
- テスト: サンドボックス/イベントリプレイでの再現性

### Next.js Secure（Middleware/Route/Service, typed/secure）
- RSC/CSRの境界: Server/Client Componentsの責務分離
- Middleware順序: 認証/認可/RateLimit/CORSの適用順
- 型安全: zod等でのバリデーション、エラー整形（400/403/500）
- Edge/Nodeランタイム: どちらで動作するかとAPI差異（Headers/Response）
- 回帰: ページナビ/フォーム/SSRとの干渉や副作用

—

補足:
- 変更は`preview-spike`→`apply-spike`→`validate-spike`の順で適用（サーバーはdiff返却、適用はクライアント側）
- 大量適用時は `synth-bulk` と `--nonexistent-only` を併用し、重複出力を避けつつ進めてください


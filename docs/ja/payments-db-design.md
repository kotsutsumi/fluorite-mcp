# Payments: SQLite/JSON 永続化の設計指針（最小）

Stripe 等のWebhook処理で最小の整合性と可観測性を確保するためのガイドです。examples/pack-examples/payments-full の実装をベースに拡張できます。

## 目標
- Idempotency（重複抑止）: processed_events により二重処理を防ぐ
- 一貫した状態遷移: subscriptions の status を確実に更新
- 監査: audit_events で処理の足跡を残す（タイプ・時刻・顧客）

## スキーマ（SQLite）

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  updatedAt INTEGER NOT NULL,
  customer TEXT
);
CREATE TABLE IF NOT EXISTS processed_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  receivedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  subId TEXT,
  status TEXT,
  customer TEXT,
  at INTEGER NOT NULL
);
```

- processed_events.id のユニーク制約で重複を抑止
- audit_events は最新 N 件（例: 1000）程度を保持（サイズ管理は運用で）

## トランザクション/再試行の最小パターン

- better-sqlite3 の transaction でバルク操作（upsert / markProcessed）を包む
- 競合/ロック例外時は短い backoff を伴う軽い再試行（指数的に 100ms, 200ms … など）
- 成功応答（200）を返す前に markProcessed を実行し、重複ウィンドウを短縮

## 推奨イベント処理の流れ

1) 署名検証（失敗→400/警告通知）
2) idempotency 確認（processed_events 参照→重複なら 200 duplicate）
3) handlers[event.type] を実行（DB更新/通知など）
4) processed_events へ登録（トランザクション）
5) 200 応答 + SLO/通知

## 再試行/DLQ
- ハンドラ失敗時は 500 応答（Stripe 側の再試行に任せる）＋DLQへ格納
- /dlq, /dlq/replay で開発中の再実行をサポート
- 本番ではキュー（SQS等）/ワーカーの導入を検討

## JSON 永続化
- SUB_DB_FILE を用いる JSON ファイル保存は小規模/検証用途に有効
- processed/audits も JSON に保存し、最新 N 件にローテーション

## 追加アイデア
- 複合更新: 顧客テーブル/サブスクテーブル等を同一トランザクションで upsert
- ユニーク制約: customer_id + plan_id などに unique を貼り、二重作成を防止
- Outbox パターン: DBにイベントを保存→別プロセス/ジョブで非同期配信
- マイグレーション: better-sqlite3 でも `PRAGMA user_version` や専用マイグレータで段階的に適用

---

examples ではあくまで「最小の雛形」を示しています。実運用ではRDB/キュー/Secrets管理/監査要件に合わせた強化を行ってください。

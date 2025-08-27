## Strike 適用と検証のレシピ（おすすめ）

テンプレート（スパイク）を安全に適用→確認→微調整する流れを、よくあるユースケース別にまとめます。

### 1) Next.js セキュア構成（nextjs-secure パック）

目的: 型安全な API Route とミドルウェアを導入し、最小の検証フローを確立する。

コマンド例（Claude Code から）:

```
/fl:spike auto "Next.js に typed middleware を追加"
/fl:spike preview id=strike-nextjs-middleware-typed-ts
```

CLI で素材探索・適用（ローカル）:

```
fluorite spikes synth --pack nextjs-secure --generated-only --max 20
fluorite spikes synth --pack nextjs-secure --generated-only --write --pretty --max 10 --nonexistent-only
```

検証ポイント:

- `app/api/health/route.ts` が 200/JSON を返す
- `middleware.ts` が存在し、不要ならばパス条件を調整
- `app/api/typed/route.ts`（ある場合）で zod 検証が 400 を返すケースを含めてハッピーパス/バッドパスを確認

### 2) 検索（search パック: ES/OS/Meili/Typesense/Algolia）

目的: 検索SDKクライアントと最小のインデックス書き込みを導入。

実行:

```
FLUORITE_GENERATED_SPIKES_LIMIT=160000 FLUORITE_SPIKE_LIST_LIMIT=200000 \
  fluorite spikes synth-bulk --pack search --generated-only --total 100 --batch 50 --pretty
```

検証ポイント:

- SDK初期化に必要な環境変数（URL/APIキー）を .env に設定
- `indexDoc()` などの関数でドキュメント投入が成功する
- 404/認可エラー/スキーマ不一致の失敗パスも確認

### 3) 監視/APM/ログ（monitoring パック）

目的: 監視基盤の導入（Sentry/PostHog/Datadog/NewRelic/Prometheus/Pino/Winston）。

実行:

```
FLUORITE_GENERATED_SPIKES_LIMIT=160000 FLUORITE_SPIKE_LIST_LIMIT=200000 \
  fluorite spikes synth-bulk --pack monitoring --generated-only --total 100 --batch 50 --pretty
```

検証ポイント:

- SDK/APIキー類の設定（秘密情報はSecret Manager経由）
- 例外/ログ送信の可観測性（ダッシュボード/ログでイベント確認）
- 低負荷時/高負荷時のオーバーヘッド/サンプリング設定

### 4) 決済（payments パック）

目的: WebhookやServiceの雛形から安全にイベント処理を組み立てる。

実行:

```
fluorite spikes synth --pack payments --generated-only --write --pretty --max 40 --nonexistent-only
```

検証ポイント:

- Stripe Webhook の署名検証（テスト用シークレットとEvent Replayで確認）
- リトライ/冪等性（Idempotency-Key）
- 失敗時の通知/アラート導線（Slack/メールなど）

---

補足:

- `--nonexistent-only` を併用すると重複回避で速度が安定します
- 大量生成は `synth-bulk` を使い、stateファイルでレジューム
- 合成テンプレは `preview-spike` → `apply-spike` → `validate-spike` の順で安全に適用


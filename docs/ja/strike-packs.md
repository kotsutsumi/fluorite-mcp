## Strike Packs（用途別テンプレート・パック）

大量の `strike-*`/`gen-*` テンプレートの中から、よく使う組み合わせを「パック」としてまとめ、発見/書き出しを簡単にする仕組みです。

### 代表パック

- `nextjs-secure`: Next.js のセキュア構成（middleware/route/service, secure/typed 中心, TS）
- `bun-elysia-worker`: Bun + Elysia の worker/listener（typed/testing/basic, TS）
- `payments`: 決済（Stripe/Paddle/PayPal/Braintree, service/route/webhook, TS/JS）
- `search`: 検索（Elasticsearch/OpenSearch/MeiliSearch/Typesense/Algolia, client/service, TS）
- `storage`: ストレージ（S3/GCS/Azure Blob/MinIO/Cloudinary/UploadThing, adapter/service, TS）
- `monitoring`: 監視/APM/ログ（Sentry/PostHog/Datadog/NewRelic/Prometheus/Pino/Winston, TS）

内部定義: `src/core/spike-packs.ts`（検証観点は `docs/ja/pack-checklists.md` も参照）

### CLI での使い方

パック一覧を表示:

```
fluorite spikes packs
```

生成スパイクをパックで絞って一覧（`--generated-only` 推奨）:

```
fluorite spikes synth --pack nextjs-secure --generated-only
```

パックを素材に大量書き出し（物理 JSON 化）:

```
# 100件を書き出し（pretty print）
fluorite spikes synth --pack payments --generated-only --write --pretty --max 100

# インクリメンタルに追加（状態ファイル維持）
fluorite spikes synth-next --pack storage --generated-only --max 50

# バルク生成（totalをバッチ分けで進める）
fluorite spikes synth-bulk --pack search --generated-only --total 1000 --batch 100 --pretty
```

### 運用レシピ（おすすめ）

- 検索（search）をまず増強（ES/OS/Meili/Typesense/Algolia）
  - `FLUORITE_GENERATED_SPIKES_LIMIT=160000 FLUORITE_SPIKE_LIST_LIMIT=200000 \
     fluorite spikes synth-bulk --pack search --generated-only --total 100 --batch 50 --pretty`
- ストレージ（storage）は既存テンプレが多いので上書きしない方針で徐々に追加
  - `fluorite spikes synth --pack storage --generated-only --write --pretty --max 20 --nonexistent-only`
- 監視/APM/ログ（monitoring）を100件単位で投入
  - `FLUORITE_GENERATED_SPIKES_LIMIT=160000 FLUORITE_SPIKE_LIST_LIMIT=200000 \
     fluorite spikes synth-bulk --pack monitoring --generated-only --total 100 --batch 50 --pretty`
- 決済（payments）は重複が出やすいので小さめのバッチで追加
  - `fluorite spikes synth --pack payments --generated-only --write --pretty --max 40 --nonexistent-only`

ヒント: `--nonexistent-only` を併用して重複出力（skip）を避けると高速です。

オプションの併用例:

- `--filter '^strike-nextjs-'` と組み合わせてさらに狭める
- `--nonexistent-only` で既存ファイルを除外
- `--prefix myorg-` でID衝突を避けつつ出力

### 実装メモ

- パックの定義は lib/pattern/style/lang を主に使用（`idFilter` で補助）
- 生成IDの一般形: `<prefix><lib>-<pattern>-<style>-<lang>`（`gen-` / `strike-`）
- 物理テンプレ名は厳密に合わない場合があるため、パック名を含む場合に限りヒューリスティックで含めます

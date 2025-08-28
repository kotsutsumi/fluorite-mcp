## パック別 最小サンプル（動作確認に使える例）

各パックのテンプレ適用後に、そのまま実行/確認できる最小サンプルの要点をまとめます。

### Search（Meili/Typesense/ES/OS/Algolia）

- 生成物例: `src/search/meilisearch.ts` or `typesense.ts`
- 動作確認（擬似コード）:
  ```ts
  import { meili } from './src/search/meilisearch';
  async function main(){
    const i = meili.index('samples');
    await i.addDocuments([{ id: '1', title: 'hello' }]);
    const r = await i.search('hello');
    console.log(r.hits.length > 0 ? 'ok' : 'empty');
  }
  main().catch(console.error);
  ```
  環境変数: `MEILI_HOST`, `MEILI_API_KEY`

### Storage（S3/GCS/Azure Blob/MinIO/Cloudinary）

- 生成物例: `src/storage/s3.ts`
- 動作確認（擬似コード）:
  ```ts
  import { putObject, getObject } from './src/storage/s3';
  async function main(){
    const b = process.env.BUCKET || 'my-bucket';
    await putObject(b, 'hello.txt', new TextEncoder().encode('hello'));
    const r = await getObject(b, 'hello.txt');
    console.log(r ? 'ok' : 'ng');
  }
  main().catch(console.error);
  ```

### Monitoring（Sentry/PostHog/Datadog/NewRelic/Prometheus/Pino/Winston）

- 生成物例: `src/monitoring/*` or `src/logger/*`
- 動作確認（擬似コード）:
  ```ts
  import pino from 'pino';
  const log = pino();
  log.info({ ok: true }, 'hello');
  ```
  Sentry/PostHog は初期化後に意図的な例外/イベント送信でダッシュボード確認。

### Payments（Stripe/Paddle/Braintree）

- 生成物例: `app/api/stripe/webhook/route.ts` or `src/payments/stripe.ts`
- 確認: Stripe CLI の `stripe trigger payment_intent.succeeded` を利用、署名検証が通ること（Mis-signは400）。

#### フル例（Stripe webhook + metrics）
- `examples/pack-examples/payments-full/index.ts`
- `STRIPE_WEBHOOK_SECRET` を設定して起動: 
  ```bash
  PORT=3003 STRIPE_WEBHOOK_SECRET=whsec_xxx npx tsx examples/pack-examples/payments-full/index.ts
  ```
- ヘルス/メトリクス:
  ```bash
  curl -s localhost:3003/health | jq
  curl -s localhost:3003/metrics
  ```

#### フル例（S3 presigned PUT + CORS）
- `examples/pack-examples/storage-full/index.ts`
- 署名発行時の制約:
  - バケット/キーは許可リスト（`ALLOW_BUCKETS`/`ALLOW_KEY_PREFIXES`）で制限可能
  - Content-Type/Cache-Control/ACL を指定すると、署名に含まれ、アップロード時に同値ヘッダが要求されます
  - CORS は `ORIGIN`/`CORS_ORIGIN` で制御
- 起動例:
  ```bash
  PORT=3004 AWS_REGION=us-east-1 \
    ALLOW_BUCKETS=my-bucket \
    ALLOW_KEY_PREFIXES=uploads/,assets/ \
    npx tsx examples/pack-examples/storage-full/index.ts
  ```
  発行例:
  ```bash
  curl -s -X POST localhost:3004/sign-put -H 'content-type: application/json' \
    -d '{"provider":"s3","bucket":"my-bucket","key":"uploads/test.txt","expires":300,"contentType":"text/plain","cacheControl":"public, max-age=31536000","acl":"public-read"}' | jq
  ```
  Content-MD5 を付与して検証する場合:
  ```bash
  base64_md5=$(openssl dgst -md5 -binary path/to/file | base64)
  curl -s -X POST localhost:3004/sign-put -H 'content-type: application/json' \
    -d '{"provider":"s3","bucket":"my-bucket","key":"uploads/file.txt","contentType":"text/plain","contentMD5":"'"$base64_md5"'"}' | jq
  # アップロード後に報告（任意）
  curl -s -X POST localhost:3004/uploaded -H 'content-type: application/json' \
    -d '{"provider":"s3","bucket":"my-bucket","key":"uploads/file.txt","md5":"'"$base64_md5"'"}'
  # HEADで検証（ETagとサイズ）
  curl -s -X POST localhost:3004/verify -H 'content-type: application/json' \
    -d '{"provider":"s3","bucket":"my-bucket","key":"uploads/file.txt","md5":"'"$base64_md5"'"}' | jq
  ```

### Next.js Secure（Middleware/Route/Service）

- 生成物例: `middleware.ts`, `app/api/health/route.ts`, `app/api/typed/route.ts`
- 確認:
  - `GET /api/health` が `{ ok: true }`
  - `POST /api/typed` に不正payloadで400、正規payloadで200
  - middleware の適用順や対象パスを調整して副作用が無いこと

—

補足: 詳細な検証観点は `docs/ja/pack-checklists.md`、適用手順は `docs/ja/strike-recipes.md` を参照。

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

### Next.js Secure（Middleware/Route/Service）

- 生成物例: `middleware.ts`, `app/api/health/route.ts`, `app/api/typed/route.ts`
- 確認:
  - `GET /api/health` が `{ ok: true }`
  - `POST /api/typed` に不正payloadで400、正規payloadで200
  - middleware の適用順や対象パスを調整して副作用が無いこと

—

補足: 詳細な検証観点は `docs/ja/pack-checklists.md`、適用手順は `docs/ja/strike-recipes.md` を参照。


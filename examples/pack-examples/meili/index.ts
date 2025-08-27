// Minimal MeiliSearch sanity check
// Env: MEILI_HOST, MEILI_API_KEY
// Run: npx tsx examples/pack-examples/meili/index.ts
import { MeiliSearch } from 'meilisearch';

async function main() {
  const host = process.env.MEILI_HOST || 'http://127.0.0.1:7700';
  const apiKey = process.env.MEILI_API_KEY;
  const client = new MeiliSearch({ host, apiKey });
  const index = client.index('samples');
  await index.addDocuments([{ id: '1', title: 'hello' }]);
  const res = await index.search('hello');
  console.log(res.hits.length > 0 ? 'ok' : 'empty');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

// Strike Packs: 代表的な用途別プリセットフィルタ
// IDは gen- または strike- の仮想スパイク、および物理 spike 名も対象（可能な範囲で解釈）

export interface SpikePackDef {
  name: string;
  description: string;
  include?: { libs?: string[]; patterns?: string[]; styles?: string[]; langs?: string[] };
  exclude?: { libs?: string[]; patterns?: string[]; styles?: string[]; langs?: string[] };
  // 任意の追加フィルタ（ID文字列全体に対するテスト）
  idFilter?: RegExp;
}

export const SPIKE_PACKS: Record<string, SpikePackDef> = {
  'nextjs-secure': {
    name: 'nextjs-secure',
    description: 'Next.js のセキュア構成（middleware/route/service, secure/typed 中心）',
    include: { libs: ['nextjs'], patterns: ['middleware','route','service'], styles: ['secure','typed'], langs: ['ts'] }
  },
  'bun-elysia-worker': {
    name: 'bun-elysia-worker',
    description: 'Bun + Elysia の worker/listener まわり',
    include: { libs: ['bun-elysia','elysia'], patterns: ['worker','listener'], styles: ['typed','testing','basic'], langs: ['ts'] }
  },
  payments: {
    name: 'payments',
    description: '決済・課金関連（Stripe/Paddle/PayPal/Braintree）',
    include: { libs: ['stripe','paddle','paypal','braintree'], patterns: ['service','route','webhook'], styles: ['typed','secure','basic'], langs: ['ts','js'] }
  },
  search: {
    name: 'search',
    description: '検索・全文検索（Elasticsearch/OpenSearch/MeiliSearch/Typesense/Algolia）',
    include: { libs: ['elasticsearch','opensearch','meilisearch','typesense','algolia'], patterns: ['client','service','adapter'], styles: ['typed','basic'], langs: ['ts'] }
  },
  storage: {
    name: 'storage',
    description: 'オブジェクトストレージ/アップロード（S3/GCS/Azure Blob/MinIO/Cloudinary/UploadThing）',
    include: { libs: ['s3','gcs','azure-blob','minio','cloudinary','uploadthing'], patterns: ['adapter','service','client','route'], styles: ['typed','secure','basic'], langs: ['ts'] }
  },
  monitoring: {
    name: 'monitoring',
    description: '監視/APM/ログ（Sentry/PostHog/Datadog/NewRelic/Prometheus/Pino/Winston）',
    include: { libs: ['sentry','posthog','datadog','newrelic','prometheus','pino','winston'], patterns: ['middleware','service','config','adapter'], styles: ['typed','basic','secure'], langs: ['ts'] }
  }
  ,
  'flow-tree-starter': {
    name: 'flow-tree-starter',
    description: 'ReactFlow + Shadcn TreeView のUI/サーバ/スキーマ/ブリッジを含むスターター',
    include: {
      libs: ['reactflow','shadcn-tree-view'],
      patterns: ['component','route','schema','adapter','example','docs','realtime','graphql-server','graphql-client','dnd','virtualize'],
      styles: ['typed','advanced','testing'],
      langs: ['ts','js','py']
    }
  }
  ,
  'flow-tree-ops': {
    name: 'flow-tree-ops',
    description: 'Flow/Tree の運用系（snapshot/export/replay と secure/realtime/graphql を含む）',
    include: {
      libs: ['reactflow','shadcn-tree-view'],
      patterns: ['snapshot','export','replay','realtime','graphql-server','graphql-client','route','adapter'],
      styles: ['typed','secure','advanced','testing'],
      langs: ['ts','js','py']
    }
  }
};

// gen-/strike-の一般的ID: <prefix><lib>-<pattern>-<style>-<lang>
const ID_RE = /^(?:gen-|strike-)?([^\s]+?)-([^-]+)-([^-]+)-([^-]+)$/;

export function parseGeneratedLikeId(id: string): { lib: string; pattern: string; style: string; lang: string } | null {
  const m = id.match(ID_RE);
  if (!m) return null;
  return { lib: m[1], pattern: m[2], style: m[3], lang: m[4] };
}

export function filterIdsByPack(ids: string[], packName: string): string[] {
  const def = SPIKE_PACKS[packName];
  if (!def) return [];
  const inc = def.include || {};
  const exc = def.exclude || {};

  const inSet = (val: string, set?: string[]) => (!set || set.length === 0 || set.includes(val));
  const notInSet = (val: string, set?: string[]) => (!set || !set.includes(val));

  const out: string[] = [];
  for (const id of ids) {
    if (def.idFilter && !def.idFilter.test(id)) continue;
    const p = parseGeneratedLikeId(id);
    if (!p) {
      // 物理ファイル名などはpack名に含む語句でざっくり判定（保守的）
      if (def.name && id.includes(def.name)) out.push(id);
      continue;
    }
    const okInc = inSet(p.lib, inc.libs) && inSet(p.pattern, inc.patterns) && inSet(p.style, inc.styles) && inSet(p.lang, inc.langs);
    if (!okInc) continue;
    const okExc = notInSet(p.lib, exc.libs) && notInSet(p.pattern, exc.patterns) && notInSet(p.style, exc.styles) && notInSet(p.lang, exc.langs);
    if (!okExc) continue;
    out.push(id);
  }
  return out;
}

export function listPacks(): Array<{ key: string; name: string; description: string }>{
  return Object.entries(SPIKE_PACKS).map(([key, def])=> ({ key, name: def.name, description: def.description }));
}

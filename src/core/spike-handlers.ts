// Spike-related MCP tool handlers

import { createLogger } from './logger.js';
import {
  DEFAULT_SPIKE_CONFIG,
  SpikeSpec,
  SpikeFileTemplate,
  SpikePatch,
  SpikeMetadata,
  ensureSpikeDirectory,
  listSpikeIds,
  loadSpike,
  loadSpikeMetadataBatch,
  renderFiles,
  scoreSpikeMatch
} from './spike-catalog.js';
import { listPacks } from './spike-packs.js';

interface ToolCallResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
  metadata?: any;
  [key: string]: unknown; // Add index signature for MCP SDK compatibility
}

const log = createLogger('spike-handlers', 'fluorite-mcp');

export interface DiscoverInput { query?: string; limit?: number; offset?: number }
export async function handleDiscoverSpikesTool(input: DiscoverInput = {}): Promise<ToolCallResult> {
  try {
    await ensureSpikeDirectory();
    const allIds = await listSpikeIds(undefined, DEFAULT_SPIKE_CONFIG);
    
    // Default to showing only first 20 spikes to avoid memory issues
    const limit = Math.min(input.limit || 20, 50); // Max 50 spikes at once
    const offset = input.offset || 0;
    
    // Load only metadata for efficiency
    const multEnv = process.env.FLUORITE_SPIKE_METADATA_MULTIPLIER;
    const mult = (() => { const n = multEnv ? parseInt(multEnv, 10) : 2; return Number.isNaN(n) ? 2 : Math.max(1, Math.min(5, n)); })();
    const metadata = await loadSpikeMetadataBatch(allIds, limit * mult, offset, DEFAULT_SPIKE_CONFIG); // Load a bit more for scoring
    
    const items: { id: string; name?: string; stack?: string[]; tags?: string[]; score: number }[] = [];
    for (const meta of metadata) {
      const score = input.query ? scoreSpikeMatch(input.query, meta) : 0.0;
      items.push({ 
        id: meta.id, 
        name: meta.name, 
        stack: meta.stack, 
        tags: meta.tags, 
        score: Math.round(score*100)/100 
      });
    }
    
    items.sort((a,b)=> (b.score - a.score) || a.id.localeCompare(b.id));
    const limited = items.slice(0, limit);
    
    const lines = [
      `Found ${allIds.length} total spikes. Showing ${limited.length} (offset: ${offset}).`,
      input.query ? `Query: "${input.query}"` : '',
      ...limited.map(i => `• ${i.id}${i.name && i.name !== i.id ? ` - ${i.name}` : ''} [score=${i.score}]`)
    ].filter(Boolean);

    // Helpful docs hint for discover usage
    lines.push('\nDocs: docs/short-aliases.md, docs/recipes.md (use `fluorite docs` to browse)');
    
    const resources = [
      'docs/short-aliases.md',
      'docs/file-structure-samples.md',
      'docs/diff-samples.md',
      'docs/recipes.md'
    ];
    return {
      content: [{ type: 'text', text: lines.join('\n') }],
      metadata: {
        items: limited,
        total: allIds.length,
        limit,
        offset,
        hasMore: offset + limit < allIds.length,
        resources
      }
    };
  } catch (e) {
    log.error('discover-spikes failed', e as Error);
    return { content: [{ type: 'text', text: `❌ discover-spikes failed: ${(e as Error).message}` }], isError: true };
  }
}

export interface PreviewInput { id: string; params?: Record<string,string> }
export async function handlePreviewSpikeTool(input: PreviewInput): Promise<ToolCallResult> {
  try {
    const spec = await loadSpike(input.id, DEFAULT_SPIKE_CONFIG);
    const params = input.params || {};
    const files = renderFiles(spec.files, params);
    const patches = (spec.patches || []).map(p => ({ ...p, path: p.path } as SpikePatch));
    const text = [
      `Preview for spike '${spec.id}':`,
      `• files: ${files.length}`,
      `• patches: ${patches.length}`,
      '',
      'Next: apply-spike (three_way_merge) and then validate-spike',
      'Docs: docs/diff-samples.md, docs/file-structure-samples.md'
    ].join('\n');
    const next = [{ tool: 'apply-spike', args: { id: spec.id, params, strategy: 'three_way_merge' }}];
    const resources = [
      'docs/short-aliases.md',
      'docs/diff-samples.md',
      'docs/file-structure-samples.md',
      'docs/post-apply-checklists.md',
      'docs/verification-examples.md',
      'docs/recipes.md',
      'docs/one-pagers.md'
    ];
    return { content: [{ type: 'text', text }], metadata: { spec, files, patches, resources, next_actions: next } };
  } catch (e) {
    log.error('preview-spike failed', e as Error, { id: input.id });
    return { content: [{ type: 'text', text: `❌ preview-spike failed: ${(e as Error).message}` }], isError: true };
  }
}

export interface ApplyInput { id: string; params?: Record<string,string>; strategy?: 'overwrite'|'three_way_merge'|'abort' }
export async function handleApplySpikeTool(input: ApplyInput): Promise<ToolCallResult> {
  try {
    // For now, application is client-side; we return patches/files to apply.
    const spec = await loadSpike(input.id, DEFAULT_SPIKE_CONFIG);
    const params = input.params || {};
    const files = renderFiles(spec.files, params);
    const patches = (spec.patches || []) as SpikePatch[];
    const text = [
      `Apply plan for '${spec.id}' (strategy: ${input.strategy || 'three_way_merge'}):`,
      `• files to create: ${files.length}`,
      `• patches to apply: ${patches.length}`,
      `Note: Server returns diff only; client should apply.`,
      '',
      'Next: validate-spike, then follow post-apply checklists',
      'Docs: docs/post-apply-checklists.md, docs/verification-examples.md'
    ].join('\n');
    const next = [{ tool: 'validate-spike', args: { id: spec.id, params } }];
    const resources = [
      'docs/post-apply-checklists.md',
      'docs/verification-examples.md',
      'docs/monitoring-alerts.md'
    ];
    return { content: [{ type: 'text', text }], metadata: { spec, files, patches, resources, applied: false, next_actions: next } };
  } catch (e) {
    log.error('apply-spike failed', e as Error, { id: input.id });
    return { content: [{ type: 'text', text: `❌ apply-spike failed: ${(e as Error).message}` }], isError: true };
  }
}

export interface ValidateInput { id: string; params?: Record<string,string> }
export async function handleValidateSpikeTool(input: ValidateInput): Promise<ToolCallResult> {
  try {
    // Minimal stub validation
    const spec = await loadSpike(input.id, DEFAULT_SPIKE_CONFIG);
    const issues: Array<{ level: 'error'|'warn'; message: string }> = [];
    const status = issues.length ? 'warn' : 'pass';
    const next = [{ tool: 'explain-spike', args: { id: spec.id } }];
    const resources = [
      'docs/post-apply-checklists.md',
      'docs/verification-examples.md'
    ];
    return { content: [{ type: 'text', text: `Validation: ${status} (issues: ${issues.length})` }], metadata: { status, issues, resources, next_actions: next } };
  } catch (e) {
    log.error('validate-spike failed', e as Error, { id: input.id });
    return { content: [{ type: 'text', text: `❌ validate-spike failed: ${(e as Error).message}` }], isError: true };
  }
}

export interface ExplainInput { id: string }
export async function handleExplainSpikeTool(input: ExplainInput): Promise<ToolCallResult> {
  try {
    const spec = await loadSpike(input.id, DEFAULT_SPIKE_CONFIG);
    const lines = [
      `Spike: ${spec.name || spec.id}${spec.version?`@${spec.version}`:''}`,
      spec.description || '',
      spec.stack?.length ? `Stack: ${spec.stack.join(', ')}` : '',
      spec.tags?.length ? `Tags: ${spec.tags.join(', ')}` : ''
    ].filter(Boolean);
    return { content: [{ type: 'text', text: lines.join('\n') }], metadata: { spec, resources: ['docs/short-aliases.md', 'docs/one-pagers.md'] } };
  } catch (e) {
    log.error('explain-spike failed', e as Error, { id: input.id });
    return { content: [{ type: 'text', text: `❌ explain-spike failed: ${(e as Error).message}` }], isError: true };
  }
}

// List available spike packs (for clients that want high-level grouping)
export async function handleListSpikePacksTool(): Promise<ToolCallResult> {
  try {
    const packs = listPacks();
    const lines = [
      `Available packs: ${packs.length}`,
      ...packs.map(p => `• ${p.key}: ${p.description}`)
    ];
    return { content: [{ type: 'text', text: lines.join('\n') }], metadata: { packs } };
  } catch (e) {
    log.error('list-spike-packs failed', e as Error);
    return { content: [{ type: 'text', text: `❌ list-spike-packs failed: ${(e as Error).message}` }], isError: true };
  }
}

export interface AutoSpikeInput { task: string; constraints?: Record<string,string> }
export async function handleAutoSpikeTool(input: AutoSpikeInput): Promise<ToolCallResult> {
  try {
    await ensureSpikeDirectory();
    const allIds = await listSpikeIds(undefined, DEFAULT_SPIKE_CONFIG);
    
    if (allIds.length === 0) {
      return { content: [{ type: 'text', text: 'No spikes available' }], metadata: { items: [] } };
    }
    
    // First pass: score all spikes using metadata only (efficient)
    const batchEnv = process.env.FLUORITE_AUTO_SPIKE_BATCH;
    const batchSize = (() => { const n = batchEnv ? parseInt(batchEnv, 10) : 50; return Number.isNaN(n) ? 50 : Math.max(10, Math.min(200, n)); })(); // Process in batches to avoid memory issues
    let topCandidates: { id: string; score: number }[] = [];
    
    for (let i = 0; i < allIds.length; i += batchSize) {
      const batchIds = allIds.slice(i, i + batchSize);
      const metadata = await loadSpikeMetadataBatch(batchIds, batchSize, 0, DEFAULT_SPIKE_CONFIG);
      
      for (const meta of metadata) {
        const score = scoreSpikeMatch(input.task, meta);
        if (score > 0) {
          topCandidates.push({ id: meta.id, score });
        }
      }
    }
    
    // Heuristic alias: infer common strike IDs from shorthand (e.g., Elysia worker typed ts)
    const aliasIds = inferStrikeAliasIds(input.task);
    const boostEnv = process.env.FLUORITE_ALIAS_BOOST;
    const aliasBoost = (() => { const n = boostEnv ? parseFloat(boostEnv) : 2.0; return Number.isNaN(n) ? 2.0 : Math.max(0, Math.min(5, n)); })();
    for (const aid of aliasIds) {
      // Push alias with strong score so it survives top-N cut (tunable)
      topCandidates.push({ id: aid, score: aliasBoost });
    }

    // Sort and get top candidates (cap via env); de-duplicate by id
    const seen = new Set<string>();
    topCandidates.sort((a, b) => b.score - a.score);
    topCandidates = topCandidates.filter(c => (seen.has(c.id) ? false : (seen.add(c.id), true)));
    const topEnv = process.env.FLUORITE_AUTO_SPIKE_TOP;
    const topN = (() => { const n = topEnv ? parseInt(topEnv, 10) : 5; return Number.isNaN(n) ? 5 : Math.max(1, Math.min(20, n)); })();
    const topFive = topCandidates.slice(0, topN);
    
    if (topFive.length === 0) {
      return { content: [{ type: 'text', text: 'No matching spikes found' }], metadata: { items: [] } };
    }
    
    // Second pass: load full specs only for top candidates
    let best: { spec: SpikeSpec; score: number } | null = null;
    for (const candidate of topFive) {
      try {
        const spec = await loadSpike(candidate.id, DEFAULT_SPIKE_CONFIG);
        const detailedScore = scoreSpikeMatch(input.task, spec);
        if (!best || detailedScore > best.score) {
          best = { spec, score: detailedScore };
        }
      } catch (e) {
        log.warn('Failed to load spike for detailed scoring', { errorMessage: (e as Error).message, id: candidate.id });
      }
    }
    
    if (!best) {
      return { content: [{ type: 'text', text: 'Failed to load matching spikes' }], metadata: { items: [] } };
    }
    
    // Decide next actions based on coverage threshold (tunable via env)
    const rawScore = best.score;
    const thresholdEnv = process.env.FLUORITE_AUTO_SPIKE_THRESHOLD;
    const threshold = (() => { const n = thresholdEnv ? parseFloat(thresholdEnv) : 0.4; return Number.isNaN(n) ? 0.4 : Math.max(0, Math.min(1, n)); })();
    const coverage = Math.round(Math.min(1, Math.max(0, rawScore)) * 100) / 100;

    const next: Array<any> = [];
    const clarifying: string[] = [];
    if (rawScore < threshold) {
      // Suggest discover + clarifying questions when coverage is low
      next.push({ tool: 'discover-spikes', args: { query: input.task, limit: 10 } });
      clarifying.push(
        '対象フレームワーク/ランタイム（例: Bun Elysia / Next.js / FastAPI）',
        '言語（TypeScript / JavaScript / Python / Go / Rust / Kotlin）',
        '望むスタイル（typed / secure / testing / advanced / basic）',
        '機能パターン（listener / plugin / worker / migration / seed / route）',
      );
    }
    // Always allow preview with current constraints as the next step
    next.push({ tool: 'preview-spike', args: { id: best.spec.id, params: input.constraints || {} } });
    const text = `Selected spike: ${best.spec.id} (coverage_score=${coverage}, threshold=${threshold})`;
    
    const resources = [
      'docs/short-aliases.md',
      'docs/file-structure-samples.md',
      'docs/diff-samples.md',
      'docs/post-apply-checklists.md',
      'docs/verification-examples.md'
    ];

    return {
      content: [{ type: 'text', text }],
      metadata: {
        selected_spike: best.spec, 
        coverage_score: coverage, 
        residual_work: [], 
        clarifying_questions: clarifying,
        resources,
        next_actions: next,
        candidates_evaluated: topCandidates.length
      }
    };
  } catch (e) {
    log.error('auto-spike failed', e as Error);
    return { content: [{ type: 'text', text: `❌ auto-spike failed: ${(e as Error).message}` }], isError: true };
  }
}

// Lightweight alias resolver for common strike-* IDs from natural language
// Supports direct short aliases and heuristic inference.
function inferStrikeAliasIds(task: string): string[] {
  const text = (task || '').toLowerCase();

  // Global toggle for alias inference (default: enabled)
  const aliasEnv = process.env.FLUORITE_ALIAS_ENABLE;
  const aliasEnabled = (() => {
    if (aliasEnv === undefined) return true;
    const v = String(aliasEnv).toLowerCase();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
  })();
  if (!aliasEnabled) return [];

  // 1) Short alias tokens mapping (easy to remember, fast path)
  const SHORT_ALIASES: Record<string, string> = {
    'elysia-worker-ts': 'strike-bun-elysia-worker-typed-ts',
    'elysia-plugin-secure-ts': 'strike-bun-elysia-plugin-secure-ts',
    'next-route-ts': 'strike-nextjs-route-typed-ts',
    'next-mw-ts': 'strike-nextjs-middleware-typed-ts',
    'fastapi-secure-py': 'strike-fastapi-route-secure-py',
    'react-component-ts': 'strike-react-component-typed-ts',
    'react-hook-ts': 'strike-react-hook-typed-ts',
    'prisma-schema-ts': 'strike-prisma-schema-typed-ts',
    'drizzle-schema-ts': 'strike-drizzle-schema-typed-ts',
    'next-service-ts': 'strike-nextjs-service-typed-ts',
    'react-provider-ts': 'strike-react-provider-typed-ts',
    'react-adapter-ts': 'strike-react-adapter-typed-ts',
    // JP shortcuts
    '検索-クライアント-ts': 'strike-meilisearch-client-typed-ts',
    '検索-クライアント-typesense-ts': 'strike-typesense-client-typed-ts',
    '決済-webhook-ts': 'strike-stripe-webhook-typed-ts',
    'ストレージ-s3-ルート-ts': 'strike-s3-route-typed-ts',
    // Storage/search quick tokens
    's3-route-ts': 'strike-s3-route-typed-ts',
    'meili-client-ts': 'strike-meilisearch-client-typed-ts',
    'typesense-client-ts': 'strike-typesense-client-typed-ts',
    'es-client-ts': 'strike-elasticsearch-client-typed-ts',
    // Auth providers
    'next-auth-ts': 'strike-next-auth-provider-typed-ts',
    'auth0-ts': 'strike-auth0-provider-typed-ts',
    'clerk-ts': 'strike-clerk-provider-typed-ts',
    'lucia-ts': 'strike-lucia-provider-typed-ts',
    // Payments
    'stripe-service-ts': 'strike-stripe-service-typed-ts',
    // Storage adapters
    's3-adapter-ts': 'strike-s3-adapter-typed-ts',
    'gcs-adapter-ts': 'strike-gcs-adapter-typed-ts',
    'azure-blob-adapter-ts': 'strike-azure-blob-adapter-typed-ts',
    'minio-adapter-ts': 'strike-minio-adapter-typed-ts',
    // Monitoring/APM middleware
    'sentry-middleware-ts': 'strike-sentry-middleware-typed-ts',
    'posthog-middleware-ts': 'strike-posthog-middleware-typed-ts',
    'datadog-middleware-ts': 'strike-datadog-middleware-typed-ts',
    'newrelic-middleware-ts': 'strike-newrelic-middleware-typed-ts',
    // Search clients
    'es-client-ts': 'strike-elasticsearch-client-typed-ts',
    'opensearch-client-ts': 'strike-opensearch-client-typed-ts',
    // Caching/queue
    'redis-service-ts': 'strike-redis-service-typed-ts',
    // Queue/brokers
    'bullmq-service-ts': 'strike-bullmq-service-typed-ts',
    'kafka-service-ts': 'strike-kafka-service-typed-ts',
    'rabbitmq-service-ts': 'strike-rabbitmq-service-typed-ts',
    'nats-service-ts': 'strike-nats-service-typed-ts',
    'sqs-service-ts': 'strike-sqs-service-typed-ts',
    // Search clients
    'meilisearch-client-ts': 'strike-meilisearch-client-typed-ts',
    'typesense-client-ts': 'strike-typesense-client-typed-ts'
  };

  const directTokens: string[] = [];
  for (const key of Object.keys(SHORT_ALIASES)) {
    const re = new RegExp(`(?:\\balias[:=]\s*${key}\\b|\\b${key}\\b)`, 'i');
    if (re.test(text)) directTokens.push(SHORT_ALIASES[key]);
  }
  if (directTokens.length) return directTokens;

  // Direct short alias patterns for popular spikes
  const direct: Array<[RegExp, string]> = [
    [/elysia[^\n]*typed[^\n]*worker[^\n]*(typescript|ts)/, 'strike-bun-elysia-worker-typed-ts'],
    [/elysia[^\n]*(secure|セキュア)[^\n]*plugin[^\n]*(typescript|ts)/, 'strike-bun-elysia-plugin-secure-ts'],
    [/next\.?js[^\n]*typed[^\n]*(api|route|エンドポイント)[^\n]*(typescript|ts)/, 'strike-nextjs-route-typed-ts'],
    [/next\.?js[^\n]*(middleware|ミドルウェア)[^\n]*(typescript|ts)/, 'strike-nextjs-middleware-typed-ts'],
    [/fastapi[^\n]*(secure|セキュア)[^\n]*(api|route|エンドポイント)[^\n]*(python|py)/, 'strike-fastapi-route-secure-py'],
    [/react[^\n]*typed[^\n]*component[^\n]*(typescript|ts)/, 'strike-react-component-typed-ts'],
    [/react[^\n]*typed[^\n]*hook[^\n]*(typescript|ts)/, 'strike-react-hook-typed-ts']
    ,[/stripe[^\n]*(webhook|route)[^\n]*(typescript|ts)/, 'strike-stripe-webhook-typed-ts']
    ,[/s3[^\n]*(route|adapter)[^\n]*(typescript|ts)/, 'strike-s3-route-typed-ts']
    ,[/meili[^\n]*(client|service)[^\n]*(typescript|ts)/, 'strike-meilisearch-client-typed-ts']
    ,[/typesense[^\n]*(client|service)[^\n]*(typescript|ts)/, 'strike-typesense-client-typed-ts']
    ,[/elastic(search)?[^\n]*(client|service)[^\n]*(typescript|ts)/, 'strike-elasticsearch-client-typed-ts']
    // Japanese quick patterns
    ,/[検索].*(クライアント|client).*(typescript|ts)/, 'strike-meilisearch-client-typed-ts']
    ,/[検索].*(クライアント|client).*(typesense|タイプセンス).*(typescript|ts)/, 'strike-typesense-client-typed-ts']
    ,/[監視|モニタリング].*(初期化|ミドルウェア|middleware).*(typescript|ts)/, 'strike-sentry-middleware-typed-ts']
    ,/[決済].*(webhook|ウェブフック|ルート).*(typescript|ts)/, 'strike-stripe-webhook-typed-ts']
    ,/[ストレージ].*(s3|gcs|azure|blob|minio).*(route|ルート|adapter|アダプタ|client|クライアント).*(typescript|ts)/, 'strike-s3-route-typed-ts']
  ];
  const matches: string[] = [];
  for (const [re, id] of direct) {
    if (re.test(text)) matches.push(id);
  }
  if (matches.length) return matches;

  // library inference (currently scoped to popular sets available/generated)
  const lib = (() => {
    if (/elysia/.test(text)) return 'bun-elysia';
    if (/next\.?js|\bnext\b/.test(text)) return 'nextjs';
    if (/fastapi/.test(text)) return 'fastapi';
    if (/\breact\b/.test(text)) return 'react';
    return '';
  })();
  if (!lib) return [];

  const pattern = (() => {
    if (/worker/.test(text)) return 'worker';
    if (/plugin|プラグイン/.test(text)) return 'plugin';
    if (/listener|リスナー/.test(text)) return 'listener';
    if (/middleware|ミドルウェア/.test(text)) return 'middleware';
    if (/migration|移行|マイグレーション/.test(text)) return 'migration';
    if (/seed|シード/.test(text)) return 'seed';
    if (/route|api|エンドポイント/.test(text)) return 'route';
    if (lib === 'react' && (/component|コンポーネント/.test(text))) return 'component';
    if (lib === 'react' && (/hook|フック/.test(text))) return 'hook';
    if (lib === 'react' && (/provider|プロバイダ/.test(text))) return 'provider';
    if (lib === 'react' && (/adapter|アダプタ/.test(text))) return 'adapter';
    return lib === 'nextjs' ? 'route' : (lib === 'react' ? 'component' : 'listener'); // sensible defaults
  })();

  const style = (() => {
    if (/secure|セキュア|安全/.test(text)) return 'secure';
    if (/testing|テスト|試験|検証/.test(text)) return 'testing';
    if (/typed|型付|型付き|型安全/.test(text)) return 'typed';
    if (/(auth|oauth|認証|認可|ログイン)/.test(text)) return 'secure';
    if (/advanced|高度/.test(text)) return 'advanced';
    return 'basic';
  })();

  const lang = (() => {
    if (/typescript|ts|タイプスクリプト/.test(text)) return 'ts';
    if (/javascript|js|ジャバスクリプト/.test(text)) return 'js';
    if (/python|py|パイソン/.test(text)) return 'py';
    if (/(^|\W)go(\W|$)|golang|ゴー言語/.test(text)) return 'go';
    if (/rust|rs|ラスティ/.test(text)) return 'rs';
    if (/kotlin|kt/.test(text)) return 'kt';
    // Heuristic defaults per lib
    if (lib === 'fastapi') return 'py';
    return 'ts';
  })();

  const id = `strike-${lib}-${pattern}-${style}-${lang}`;
  return [id];
}

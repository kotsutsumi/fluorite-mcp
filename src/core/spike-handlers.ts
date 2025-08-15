// Spike-related MCP tool handlers

import { createLogger } from './logger.js';
import {
  DEFAULT_SPIKE_CONFIG,
  SpikeSpec,
  SpikeFileTemplate,
  SpikePatch,
  ensureSpikeDirectory,
  listSpikeIds,
  loadSpike,
  renderFiles,
  scoreSpikeMatch
} from './spike-catalog.js';

interface ToolCallResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
  metadata?: any;
  [key: string]: unknown; // Add index signature for MCP SDK compatibility
}

const log = createLogger('spike-handlers', 'fluorite-mcp');

export interface DiscoverInput { query?: string; limit?: number }
export async function handleDiscoverSpikesTool(input: DiscoverInput = {}): Promise<ToolCallResult> {
  try {
    await ensureSpikeDirectory();
    const ids = await listSpikeIds(undefined, DEFAULT_SPIKE_CONFIG);
    const items: { id: string; name?: string; stack?: string[]; tags?: string[]; score: number }[] = [];
    for (const id of ids) {
      const spec = await loadSpike(id, DEFAULT_SPIKE_CONFIG);
      const score = input.query ? scoreSpikeMatch(input.query, spec) : 0.0;
      items.push({ id: spec.id, name: spec.name, stack: spec.stack, tags: spec.tags, score: Math.round(score*100)/100 });
    }
    items.sort((a,b)=> (b.score - a.score) || a.id.localeCompare(b.id));
    const limited = typeof input.limit === 'number' ? items.slice(0, Math.max(0, input.limit)) : items;
    const lines = [
      `Found ${items.length} spike(s). Showing ${limited.length}.`,
      ...limited.map(i => `• ${i.id}${i.name?` - ${i.name}`:''} [score=${i.score}]`)
    ];
    return { content: [{ type: 'text', text: lines.join('\n') }], metadata: { items: limited } };
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
    ].join('\n');
    const next = [{ tool: 'apply-spike', args: { id: spec.id, params, strategy: 'three_way_merge' }}];
    return { content: [{ type: 'text', text }], metadata: { spec, files, patches, next_actions: next } };
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
      `Note: Server returns diff only; client should apply.`
    ].join('\n');
    const next = [{ tool: 'validate-spike', args: { id: spec.id, params } }];
    return { content: [{ type: 'text', text }], metadata: { spec, files, patches, applied: false, next_actions: next } };
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
    return { content: [{ type: 'text', text: `Validation: ${status} (issues: ${issues.length})` }], metadata: { status, issues, next_actions: next } };
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
    return { content: [{ type: 'text', text: lines.join('\n') }], metadata: { spec } };
  } catch (e) {
    log.error('explain-spike failed', e as Error, { id: input.id });
    return { content: [{ type: 'text', text: `❌ explain-spike failed: ${(e as Error).message}` }], isError: true };
  }
}

export interface AutoSpikeInput { task: string; constraints?: Record<string,string> }
export async function handleAutoSpikeTool(input: AutoSpikeInput): Promise<ToolCallResult> {
  try {
    await ensureSpikeDirectory();
    const ids = await listSpikeIds(undefined, DEFAULT_SPIKE_CONFIG);
    let best: { spec: SpikeSpec; score: number } | null = null;
    for (const id of ids) {
      const spec = await loadSpike(id, DEFAULT_SPIKE_CONFIG);
      const s = scoreSpikeMatch(input.task, spec);
      if (!best || s > best.score) best = { spec, score: s };
    }
    if (!best) return { content: [{ type: 'text', text: 'No spikes available' }], metadata: { items: [] } };
    const coverage = Math.round(Math.min(1, Math.max(0.1, best.score)) * 100) / 100;
    const next = [{ tool: 'preview-spike', args: { id: best.spec.id, params: input.constraints || {} } }];
    const text = `Selected spike: ${best.spec.id} (coverage_score=${coverage})`;
    return { content: [{ type: 'text', text }], metadata: { selected_spike: best.spec, coverage_score: coverage, residual_work: [], next_actions: next } };
  } catch (e) {
    log.error('auto-spike failed', e as Error);
    return { content: [{ type: 'text', text: `❌ auto-spike failed: ${(e as Error).message}` }], isError: true };
  }
}


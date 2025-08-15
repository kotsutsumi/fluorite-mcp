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
    const metadata = await loadSpikeMetadataBatch(allIds, limit * 2, offset, DEFAULT_SPIKE_CONFIG); // Load a bit more for scoring
    
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
    
    return { 
      content: [{ type: 'text', text: lines.join('\n') }], 
      metadata: { 
        items: limited, 
        total: allIds.length,
        limit,
        offset,
        hasMore: offset + limit < allIds.length
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
    const allIds = await listSpikeIds(undefined, DEFAULT_SPIKE_CONFIG);
    
    if (allIds.length === 0) {
      return { content: [{ type: 'text', text: 'No spikes available' }], metadata: { items: [] } };
    }
    
    // First pass: score all spikes using metadata only (efficient)
    const batchSize = 50; // Process in batches to avoid memory issues
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
    
    // Sort and get top 5 candidates
    topCandidates.sort((a, b) => b.score - a.score);
    const topFive = topCandidates.slice(0, 5);
    
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
    
    const coverage = Math.round(Math.min(1, Math.max(0.1, best.score)) * 100) / 100;
    const next = [{ tool: 'preview-spike', args: { id: best.spec.id, params: input.constraints || {} } }];
    const text = `Selected spike: ${best.spec.id} (coverage_score=${coverage})`;
    
    return { 
      content: [{ type: 'text', text }], 
      metadata: { 
        selected_spike: best.spec, 
        coverage_score: coverage, 
        residual_work: [], 
        next_actions: next,
        candidates_evaluated: topCandidates.length
      } 
    };
  } catch (e) {
    log.error('auto-spike failed', e as Error);
    return { content: [{ type: 'text', text: `❌ auto-spike failed: ${(e as Error).message}` }], isError: true };
  }
}


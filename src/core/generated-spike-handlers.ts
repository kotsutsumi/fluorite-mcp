import { listGeneratedSpikeIdsFiltered } from './spike-generators.js';
import { createLogger } from './logger.js';

interface ToolCallResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
  metadata?: any;
  [key: string]: unknown;
}

export interface ListGeneratedInput {
  libs?: string[];
  patterns?: string[];
  styles?: string[];
  langs?: string[];
  limit?: number;
  prefix?: 'strike' | 'gen' | 'any';
}

const log = createLogger('generated-spike-handlers', 'fluorite-mcp');

export async function handleListGeneratedSpikesTool(input: ListGeneratedInput = {}): Promise<ToolCallResult> {
  try {
    const ids = listGeneratedSpikeIdsFiltered({
      libs: input.libs,
      patterns: input.patterns,
      styles: input.styles,
      langs: input.langs,
      limit: input.limit
    }).filter(id => (input.prefix === 'any' || !input.prefix)
      ? true
      : (input.prefix === 'strike' ? id.startsWith('strike-') : id.startsWith('gen-'))
    );

    const maxShow = Math.min(ids.length, 50);
    const lines = [
      `Generated spike IDs: ${ids.length} (${input.prefix || 'strike'} prefix${input.prefix === 'any' ? 'es' : ''})`,
      ...(ids.slice(0, maxShow).map(id => `• ${id}`)),
      ids.length > maxShow ? `...and ${ids.length - maxShow} more` : ''
    ].filter(Boolean);

    return {
      content: [{ type: 'text', text: lines.join('\n') }],
      metadata: { ids, count: ids.length, shown: maxShow }
    };
  } catch (e) {
    log.error('list-generated-spikes failed', e as Error);
    return { content: [{ type: 'text', text: `❌ list-generated-spikes failed: ${(e as Error).message}` }], isError: true };
  }
}

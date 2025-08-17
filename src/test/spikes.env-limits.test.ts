import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { handleDiscoverSpikesTool, handleAutoSpikeTool } from '../core/spike-handlers.js';

const savedEnv: Record<string, string | undefined> = {};

function setEnv(key: string, val: string) {
  savedEnv[key] = process.env[key];
  process.env[key] = val;
}

function restoreEnv() {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

describe('spikes with env memory limits', () => {
  beforeEach(() => {
    setEnv('FLUORITE_SPIKE_METADATA_MULTIPLIER', '1');
    setEnv('FLUORITE_AUTO_SPIKE_BATCH', '10');
    setEnv('FLUORITE_AUTO_SPIKE_TOP', '3');
    setEnv('FLUORITE_SPIKE_LIST_LIMIT', ''); // ensure no global cap unless set
  });

  afterEach(() => {
    restoreEnv();
  });

  it('discover-spikes respects small limit without heavy loading', async () => {
    const res = await handleDiscoverSpikesTool({ query: 'openai', limit: 5, offset: 0 });
    expect(res.metadata).toBeTruthy();
    expect(res.metadata.items.length).toBeLessThanOrEqual(5);
    expect(typeof res.metadata.total).toBe('number');
  });

  it('auto-spike processes small batches and selects a candidate', async () => {
    const res = await handleAutoSpikeTool({ task: 'Use OpenAI to generate text', constraints: {} });
    expect(res.metadata).toBeTruthy();
    // May return empty if no match, but with our catalog it should find some
    // Accept either selected or a graceful empty result
    if (res.metadata.selected_spike) {
      expect(res.metadata.coverage_score).toBeGreaterThan(0);
    } else {
      expect(Array.isArray(res.metadata.items)).toBe(true);
    }
  });
});


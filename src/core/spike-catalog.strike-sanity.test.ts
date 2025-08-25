import { describe, it, expect } from 'vitest';
import { listSpikeIds, loadSpike } from './spike-catalog.js';

describe('strike catalog sanity', () => {
  it('strike-* filtered list returns a healthy count', async () => {
    const prev = process.env.FLUORITE_SPIKE_LIST_LIMIT;
    delete process.env.FLUORITE_SPIKE_LIST_LIMIT;
    try {
      const ids = await listSpikeIds('^strike-');
      // Ensure we have a decent number of strike templates available
      expect(ids.length).toBeGreaterThanOrEqual(500);
      // All returned ids should match the filter
      for (const id of ids.slice(0, 50)) {
        expect(id.startsWith('strike-')).toBe(true);
      }
    } finally {
      if (prev !== undefined) process.env.FLUORITE_SPIKE_LIST_LIMIT = prev;
    }
  });

  it('loads a few recent strike spikes successfully', async () => {
    const samples = [
      'strike-nextjs-route-json-helpers-secure',
      'strike-openai-batch-responses-minimal',
      'strike-remix-route-loader-action-minimal',
      'strike-kubernetes-deployment-hpa-minimal',
      'strike-supabase-storage-upload-minimal'
    ];
    for (const id of samples) {
      const spec = await loadSpike(id);
      expect(spec && spec.id).toBe(id);
      expect((spec.files || []).length + (spec.patches || []).length).toBeGreaterThanOrEqual(1);
    }
  });
});


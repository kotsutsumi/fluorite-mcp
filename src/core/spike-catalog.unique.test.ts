import { describe, it, expect } from 'vitest';
import { listSpikeIds } from './spike-catalog.js';

describe('spike-catalog uniqueness', () => {
  it('listSpikeIds returns unique IDs (no duplicates)', async () => {
    const prev = process.env.FLUORITE_SPIKE_LIST_LIMIT;
    delete process.env.FLUORITE_SPIKE_LIST_LIMIT;
    try {
      const ids = await listSpikeIds();
      const set = new Set(ids);
      expect(set.size).toBe(ids.length);
    } finally {
      if (prev !== undefined) process.env.FLUORITE_SPIKE_LIST_LIMIT = prev;
    }
  });
});


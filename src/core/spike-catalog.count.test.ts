import { describe, it, expect } from 'vitest';
import { listSpikeIds } from './spike-catalog.js';

describe('spike-catalog count', () => {
  it('lists at least 1000 spike templates', async () => {
    const prev = process.env.FLUORITE_SPIKE_LIST_LIMIT;
    delete process.env.FLUORITE_SPIKE_LIST_LIMIT;
    try {
      const ids = await listSpikeIds();
      expect(ids.length).toBeGreaterThanOrEqual(1000);
    } finally {
      if (prev !== undefined) process.env.FLUORITE_SPIKE_LIST_LIMIT = prev;
    }
  });
});


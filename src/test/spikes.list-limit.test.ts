import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listSpikeIds } from '../core/spike-catalog.js';

let prev: string | undefined;

describe('spike catalog list limit env', () => {
  beforeEach(() => {
    prev = process.env.FLUORITE_SPIKE_LIST_LIMIT;
    process.env.FLUORITE_SPIKE_LIST_LIMIT = '10';
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.FLUORITE_SPIKE_LIST_LIMIT;
    else process.env.FLUORITE_SPIKE_LIST_LIMIT = prev;
  });

  it('respects FLUORITE_SPIKE_LIST_LIMIT', async () => {
    const ids = await listSpikeIds();
    expect(ids.length).toBeLessThanOrEqual(10);
  });
});


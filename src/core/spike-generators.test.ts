import { describe, it, expect } from 'vitest';
import { listGeneratedSpikeIds, generateSpike, isGeneratedId } from './spike-generators.js';

describe('spike-generators', () => {
  it('produces at least 10k generated spike ids by default', () => {
    const prev = process.env.FLUORITE_GENERATED_SPIKES_LIMIT;
    delete process.env.FLUORITE_GENERATED_SPIKES_LIMIT;
    try {
      const ids = listGeneratedSpikeIds();
      expect(ids.length).toBeGreaterThanOrEqual(10000);
    } finally {
      if (prev !== undefined) process.env.FLUORITE_GENERATED_SPIKES_LIMIT = prev;
    }
  });

  it('generates a valid spike spec for a sample id', () => {
    const id = 'gen-express-route-basic-ts';
    expect(isGeneratedId(id)).toBe(true);
    const spec = generateSpike(id);
    expect(spec.id).toBe(id);
    expect(spec.name).toContain('express');
    expect(spec.files && spec.files.length).toBeGreaterThan(0);
  });
});


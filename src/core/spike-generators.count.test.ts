import { describe, it, expect } from 'vitest';
import { listGeneratedSpikeIds, isGeneratedId, generateSpike } from './spike-generators.js';

describe('generated spikes scale & shape', () => {
  it('generates at least 100k virtual spike IDs', () => {
    const ids = listGeneratedSpikeIds();
    expect(ids.length).toBeGreaterThanOrEqual(100_000);
  });

  it('includes strike-branded IDs and they are recognized as generated', () => {
    const ids = listGeneratedSpikeIds();
    const strike = ids.find((id) => id.startsWith('strike-'));
    expect(strike).toBeTruthy();
    expect(isGeneratedId(strike!)).toBe(true);
  });

  it('can synthesize a spec from a strike ID', () => {
    const ids = listGeneratedSpikeIds();
    const strike = ids.find((id) => id.startsWith('strike-'))!;
    const spec = generateSpike(strike);
    expect(spec.id).toBe(strike);
    expect(spec.tags?.includes('generated')).toBe(true);
    expect(spec.tags?.includes('strike')).toBe(true);
    expect(Array.isArray(spec.files)).toBe(true);
  });
});


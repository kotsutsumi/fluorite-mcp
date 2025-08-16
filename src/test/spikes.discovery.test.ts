import { describe, it, expect } from 'vitest';
import { listSpikeIds, loadSpike, DEFAULT_SPIKE_CONFIG } from '../core/spike-catalog';

describe('spike catalog discovery', () => {
  it('lists many spike templates', async () => {
    const ids = await listSpikeIds(undefined, DEFAULT_SPIKE_CONFIG);
    // We expect a large catalog; sanity check against a conservative threshold
    expect(ids.length).toBeGreaterThan(50);
  });

  it('loads a well-known spike spec', async () => {
    const spec = await loadSpike('express-minimal', DEFAULT_SPIKE_CONFIG);
    expect(spec).toBeTruthy();
    expect(spec.id).toBe('express-minimal');
    expect(Array.isArray(spec.files) || Array.isArray(spec.patches)).toBe(true);
  });
});


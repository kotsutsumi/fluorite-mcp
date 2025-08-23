import { describe, it, expect } from 'vitest';
import { loadSpike } from './spike-catalog.js';

describe('custom strike spikes batch1', () => {
  it('loads strike-nextjs-auth-prisma-rsc', async () => {
    const spec = await loadSpike('strike-nextjs-auth-prisma-rsc');
    expect(spec.id).toBe('strike-nextjs-auth-prisma-rsc');
    expect(spec.files && spec.files.length).toBeGreaterThan(0);
  });
});


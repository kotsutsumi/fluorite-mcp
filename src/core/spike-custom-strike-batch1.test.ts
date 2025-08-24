import { describe, it, expect } from 'vitest';
import { loadSpike } from './spike-catalog.js';

describe('custom spikes batch1', () => {
  it('loads custom-nextjs-auth-prisma-rsc', async () => {
    const spec = await loadSpike('custom-nextjs-auth-prisma-rsc');
    expect(spec.id).toBe('custom-nextjs-auth-prisma-rsc');
    expect(spec.files && spec.files.length).toBeGreaterThan(0);
  });

  it('loads custom-bullmq-queue-worker-minimal', async () => {
    const spec = await loadSpike('custom-bullmq-queue-worker-minimal');
    expect(spec.id).toBe('custom-bullmq-queue-worker-minimal');
    expect(spec.files && spec.files.length).toBeGreaterThan(0);
  });

  it('loads custom-openai-function-calls-minimal', async () => {
    const spec = await loadSpike('custom-openai-function-calls-minimal');
    expect(spec.id).toBe('custom-openai-function-calls-minimal');
    expect(spec.files && spec.files.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { handleListGeneratedSpikesTool } from '../core/generated-spike-handlers.js';

describe('list-generated-spikes tool', () => {
  it('lists strike-* ids with default filters', async () => {
    const res = await handleListGeneratedSpikesTool({ limit: 20, prefix: 'strike', libs: ['nextjs','fastapi'], patterns: ['route'], styles: ['typed','secure'], langs: ['ts','py'] });
    expect(res.metadata).toBeTruthy();
    expect(res.metadata.ids.length).toBeGreaterThan(0);
    for (const id of res.metadata.ids) {
      expect(id.startsWith('strike-')).toBe(true);
    }
  });
});


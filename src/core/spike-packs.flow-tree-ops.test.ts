import { describe, it, expect } from 'vitest';
import { listGeneratedSpikeIdsFiltered } from './spike-generators.js';
import { filterIdsByPack } from './spike-packs.js';

describe('flow-tree-ops pack', () => {
  it('selects snapshot/export/replay ids', () => {
    const ids = listGeneratedSpikeIdsFiltered({
      libs: ['reactflow','shadcn-tree-view'],
      patterns: ['snapshot','export','replay'],
      styles: ['typed','secure','advanced','testing'],
      langs: ['ts','js','py'],
      limit: 300
    });
    const filtered = filterIdsByPack(ids, 'flow-tree-ops');
    expect(filtered.length).toBeGreaterThan(0);
  });
});


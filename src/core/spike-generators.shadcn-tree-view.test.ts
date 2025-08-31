import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('shadcn-tree-view spikes', () => {
  it('creates TreeView component for component pattern (ts)', () => {
    const spec = generateSpike('strike-shadcn-tree-view-component-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/TreeView.tsx')).toBe(true);
  });
  it('creates example and docs', () => {
    const ex = generateSpike('strike-shadcn-tree-view-example-typed-ts');
    const dc = generateSpike('strike-shadcn-tree-view-docs-typed-ts');
    const ep = new Set((ex.files || []).map(f => f.path));
    const dp = new Set((dc.files || []).map(f => f.path));
    expect(ep.has('src/treeview/App.tsx')).toBe(true);
    expect(dp.has('src/treeview/README.md')).toBe(true);
  });
  it('creates API adapter stub', () => {
    const spec = generateSpike('strike-shadcn-tree-view-adapter-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/api.ts')).toBe(true);
  });
});


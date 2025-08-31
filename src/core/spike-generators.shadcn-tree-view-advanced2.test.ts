import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('shadcn-tree-view virtualization/DnD/bridge reverse/a11y', () => {
  it('adds VirtualizedTree and DnDTree for advanced', () => {
    const spec = generateSpike('strike-shadcn-tree-view-component-advanced-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/VirtualizedTree.tsx')).toBe(true);
    expect(paths.has('src/components/DnDTree.tsx')).toBe(true);
  });
  it('adds fromFlow adapter', () => {
    const spec = generateSpike('strike-shadcn-tree-view-adapter-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/fromFlow.ts')).toBe(true);
  });
  it('adds a11y test placeholder when testing+route', () => {
    const spec = generateSpike('strike-shadcn-tree-view-route-testing-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/a11y.test.ts')).toBe(true);
  });
});


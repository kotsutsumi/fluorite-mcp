import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('shadcn-tree-view advanced/testing/route', () => {
  it('adds RTL testing placeholders', () => {
    const spec = generateSpike('strike-shadcn-tree-view-component-testing-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/TreeView.test.tsx')).toBe(true);
    expect(paths.has('src/components/TreeView.rtl.test.tsx')).toBe(true);
  });
  it('adds Next.js and Express routes', () => {
    const spec = generateSpike('strike-shadcn-tree-view-route-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('app/api/tree/route.ts')).toBe(true);
    expect(paths.has('src/treeview/route.ts')).toBe(true);
  });
  it('adds FastAPI route when lang=py', () => {
    const spec = generateSpike('strike-shadcn-tree-view-route-typed-py');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/fastapi_tree.py')).toBe(true);
  });
  it('adds TreeViewAdvanced component', () => {
    const spec = generateSpike('strike-shadcn-tree-view-component-advanced-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/TreeViewAdvanced.tsx')).toBe(true);
  });
});


import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('shadcn-tree-view schema/patch', () => {
  it('adds Zod schema and PATCH API (ts)', () => {
    const spec = generateSpike('strike-shadcn-tree-view-schema-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/schema.ts')).toBe(true);
    expect(paths.has('src/treeview/patch.ts')).toBe(true);
    expect(paths.has('app/api/tree/patch/route.ts')).toBe(true);
  });
  it('adds Pydantic models (py)', () => {
    const spec = generateSpike('strike-shadcn-tree-view-schema-typed-py');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/models.py')).toBe(true);
  });
});

describe('shadcn-tree-view to ReactFlow bridge', () => {
  it('adds toFlow adapter', () => {
    const spec = generateSpike('strike-shadcn-tree-view-adapter-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/toFlow.ts')).toBe(true);
  });
});


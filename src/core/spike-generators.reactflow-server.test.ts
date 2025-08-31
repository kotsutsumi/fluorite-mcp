import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('reactflow server routes', () => {
  it('adds Next.js and Express routes (ts)', () => {
    const spec = generateSpike('strike-reactflow-route-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('app/api/flow/route.ts')).toBe(true);
    expect(paths.has('src/flow/route.ts')).toBe(true);
  });
  it('adds FastAPI route when lang=py', () => {
    const spec = generateSpike('strike-reactflow-route-typed-py');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/flow/fastapi_flow.py')).toBe(true);
  });
  it('adds extra custom nodes in advanced style', () => {
    const spec = generateSpike('strike-reactflow-component-advanced-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/InputNode.tsx')).toBe(true);
    expect(paths.has('src/components/DecisionNode.tsx')).toBe(true);
  });
  it('adds RTL testing skeleton file', () => {
    const spec = generateSpike('strike-reactflow-component-testing-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/Flow.rtl.test.tsx')).toBe(true);
  });
});


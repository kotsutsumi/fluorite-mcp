import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('reactflow advanced/hook/adapter/testing', () => {
  it('adds useFlowState hook', () => {
    const spec = generateSpike('strike-reactflow-hook-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/flow/useFlowState.ts')).toBe(true);
  });
  it('adds API adapter', () => {
    const spec = generateSpike('strike-reactflow-adapter-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/flow/api.ts')).toBe(true);
  });
  it('adds FlowAdvanced and CustomNode for advanced style', () => {
    const spec = generateSpike('strike-reactflow-component-advanced-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/FlowAdvanced.tsx')).toBe(true);
    expect(paths.has('src/components/CustomNode.tsx')).toBe(true);
  });
  it('adds testing skeleton for component', () => {
    const spec = generateSpike('strike-reactflow-component-testing-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/Flow.test.tsx')).toBe(true);
  });
});


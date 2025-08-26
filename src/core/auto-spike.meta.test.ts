import { describe, it, expect, beforeEach } from 'vitest';
import { handleAutoSpikeTool } from './spike-handlers.js';

// Keep generated set and batches small to avoid heavy scans during tests
beforeEach(() => {
  process.env.FLUORITE_GENERATED_SPIKES_LIMIT = '200';
  process.env.FLUORITE_AUTO_SPIKE_TOP = '5';
  process.env.FLUORITE_AUTO_SPIKE_BATCH = '50';
});

describe('auto-spike meta flow (lightweight)', () => {
  it('selects Elysia typed worker (TS) via alias boost', async () => {
    const res = await handleAutoSpikeTool({ task: 'Elysia の typed worker を TypeScript で作成' });
    expect(res?.metadata?.selected_spike?.id || '').toContain('strike-bun-elysia-worker-typed-ts');
    const next = res?.metadata?.next_actions || [];
    expect(Array.isArray(next)).toBe(true);
    // preview should be suggested next
    const hasPreview = next.some((n: any) => n?.tool === 'preview-spike');
    expect(hasPreview).toBe(true);
  });

  it('selects Next.js typed route (TS) via alias boost', async () => {
    const res = await handleAutoSpikeTool({ task: 'Next.js で typed な API ルート（TS）を追加' });
    expect(res?.metadata?.selected_spike?.id || '').toContain('strike-nextjs-route-typed-ts');
    const next = res?.metadata?.next_actions || [];
    const hasPreview = next.some((n: any) => n?.tool === 'preview-spike');
    expect(hasPreview).toBe(true);
  });

  it('selects FastAPI secure route (Py) via alias boost', async () => {
    const res = await handleAutoSpikeTool({ task: 'FastAPI でセキュアな API を Python で実装' });
    expect(String(res?.metadata?.selected_spike?.id || '')).toContain('strike-fastapi-route-secure-py');
    const next = res?.metadata?.next_actions || [];
    const hasPreview = Array.isArray(next) && next.some((n: any) => n?.tool === 'preview-spike');
    expect(hasPreview).toBe(true);
  });

  it('selects React typed component (TS) via alias boost', async () => {
    const res = await handleAutoSpikeTool({ task: 'React の typed component を TypeScript で作成' });
    expect(String(res?.metadata?.selected_spike?.id || '')).toContain('strike-react-component-typed-ts');
    const next = res?.metadata?.next_actions || [];
    const hasPreview = Array.isArray(next) && next.some((n: any) => n?.tool === 'preview-spike');
    expect(hasPreview).toBe(true);
  });

  it('selects Next.js typed middleware (TS) via direct alias', async () => {
    const res = await handleAutoSpikeTool({ task: 'Next.js の typed middleware を TS で追加' });
    expect(String(res?.metadata?.selected_spike?.id || '')).toContain('strike-nextjs-middleware-typed-ts');
    const next = res?.metadata?.next_actions || [];
    const hasPreview = Array.isArray(next) && next.some((n: any) => n?.tool === 'preview-spike');
    expect(hasPreview).toBe(true);
  });

  it('selects React typed hook (TS) via direct alias', async () => {
    const res = await handleAutoSpikeTool({ task: 'React の typed hook を TypeScript で作成' });
    expect(String(res?.metadata?.selected_spike?.id || '')).toContain('strike-react-hook-typed-ts');
    const next = res?.metadata?.next_actions || [];
    const hasPreview = Array.isArray(next) && next.some((n: any) => n?.tool === 'preview-spike');
    expect(hasPreview).toBe(true);
  });

  it('accepts short alias tokens inside task text', async () => {
    const res = await handleAutoSpikeTool({ task: '実装: [alias: next-mw-ts] を適用してほしい' });
    expect(String(res?.metadata?.selected_spike?.id || '')).toContain('strike-nextjs-middleware-typed-ts');
    const next = res?.metadata?.next_actions || [];
    const hasPreview = Array.isArray(next) && next.some((n: any) => n?.tool === 'preview-spike');
    expect(hasPreview).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { listGeneratedSpikeIdsFiltered, generateSpike } from './spike-generators.js';

describe('LINE Developers and Expo spikes', () => {
  it('includes LINE library combinations', () => {
    const ids = listGeneratedSpikeIdsFiltered({ libs: ['line'], limit: 50 });
    expect(ids.length).toBeGreaterThan(0);
  });

  it('creates files for LINE webhook/client (TS)', () => {
    const id = 'strike-line-webhook-typed-ts';
    const spec = generateSpike(id);
    const paths = spec.files?.map((f) => f.path) || [];
    expect(paths).toContain('src/line/webhook.ts');
    expect(paths).toContain('src/line/verify.ts');
  });

  it('creates Expo example for LINE login', () => {
    const id = 'strike-expo-example-typed-ts';
    const spec = generateSpike(id);
    const paths = spec.files?.map((f) => f.path) || [];
    expect(paths).toContain('App.tsx');
  });

  it('creates LINE signature middleware and adapter', () => {
    const mid = generateSpike('strike-line-middleware-typed-ts');
    const ada = generateSpike('strike-line-adapter-typed-ts');
    const mp = new Set((mid.files || []).map((f) => f.path));
    const ap = new Set((ada.files || []).map((f) => f.path));
    expect(mp.has('src/line/middleware.ts')).toBe(true);
    expect(ap.has('src/line/echo-adapter.ts')).toBe(true);
  });

  it('creates LINE route and service for token exchange', () => {
    const rt = generateSpike('strike-line-route-secure-ts');
    const sv = generateSpike('strike-line-service-secure-ts');
    const rp = new Set((rt.files || []).map((f) => f.path));
    const sp = new Set((sv.files || []).map((f) => f.path));
    expect(rp.has('src/line/routes/exchange.ts')).toBe(true);
    expect(sp.has('src/line/oauth.ts')).toBe(true);
  });

  it('adds Next.js App Router variant for line exchange in advanced/secure', () => {
    const rtAdv = generateSpike('strike-line-route-advanced-ts');
    const rtSec = generateSpike('strike-line-route-secure-ts');
    const pA = new Set((rtAdv.files || []).map((f) => f.path));
    const pS = new Set((rtSec.files || []).map((f) => f.path));
    expect(pA.has('app/api/line/exchange/route.ts')).toBe(true);
    expect(pS.has('app/api/line/exchange/route.ts')).toBe(true);
    expect(pS.has('src/line/next/security.ts')).toBe(true);
    expect(pS.has('src/line/next/rateLimit.ts')).toBe(true);
    expect(pS.has('src/line/next/audit.ts')).toBe(true);
  });

  it('adds FastAPI variant when lang=py', () => {
    const rtPy = generateSpike('strike-line-route-typed-py');
    const rpP = new Set((rtPy.files || []).map((f) => f.path));
    expect(rpP.has('src/line/fastapi_exchange.py')).toBe(true);
    const advPy = generateSpike('strike-line-route-advanced-py');
    const ap = new Set((advPy.files || []).map((f) => f.path));
    expect(ap.has('src/line/models.py')).toBe(true);
    expect(ap.has('src/line/settings.py')).toBe(true);
  });

  it('adds Expo advanced stubs', () => {
    const exAdv = generateSpike('strike-expo-hook-advanced-ts');
    const ep = new Set((exAdv.files || []).map((f) => f.path));
    expect(ep.has('src/app/deeplink.ts')).toBe(true);
    expect(ep.has('src/components/ErrorToast.tsx')).toBe(true);
  });

  it('adds Expo secure stubs', () => {
    const exSec = generateSpike('strike-expo-hook-secure-ts');
    const sp = new Set((exSec.files || []).map((f) => f.path));
    expect(sp.has('src/hooks/useSecureFetch.ts')).toBe(true);
    expect(sp.has('src/components/ErrorBoundary.tsx')).toBe(true);
    expect(sp.has('src/components/Toast.tsx')).toBe(true);
    expect(sp.has('src/components/RetryButton.tsx')).toBe(true);
  });

  it('creates LIFF provider file', () => {
    const prov = generateSpike('strike-line-provider-typed-ts');
    const pp = new Set((prov.files || []).map((f) => f.path));
    expect(pp.has('src/line/liff.ts')).toBe(true);
  });

  it('creates Expo hook and provider for LINE', () => {
    const hook = generateSpike('strike-expo-hook-typed-ts');
    const prov = generateSpike('strike-expo-provider-typed-ts');
    const hp = new Set((hook.files || []).map((f) => f.path));
    const pp = new Set((prov.files || []).map((f) => f.path));
    expect(hp.has('src/hooks/useLineLogin.ts')).toBe(true);
    expect(pp.has('src/context/LineAuthProvider.tsx')).toBe(true);
  });

  it('creates LINE Flex helpers when example/component is selected', () => {
    const ex = generateSpike('strike-line-example-typed-ts');
    const cmp = generateSpike('strike-line-component-typed-ts');
    const ep = new Set((ex.files || []).map((f) => f.path));
    const cp = new Set((cmp.files || []).map((f) => f.path));
    expect(ep.has('src/line/flex.ts')).toBe(true);
    expect(ep.has('src/line/flex-example.ts')).toBe(true);
    expect(cp.has('src/line/flex.ts')).toBe(true);
  });

  it('adds Expo testing skeletons when style=testing', () => {
    const hookT = generateSpike('strike-expo-hook-testing-ts');
    const provT = generateSpike('strike-expo-provider-testing-ts');
    const exT = generateSpike('strike-expo-example-testing-ts');
    const hp = new Set((hookT.files || []).map((f) => f.path));
    const pp = new Set((provT.files || []).map((f) => f.path));
    const ep = new Set((exT.files || []).map((f) => f.path));
    expect(hp.has('src/hooks/useLineLogin.test.tsx')).toBe(true);
    expect(pp.has('src/context/LineAuthProvider.test.tsx')).toBe(true);
    expect(ep.has('App.test.tsx')).toBe(true);
  });
});

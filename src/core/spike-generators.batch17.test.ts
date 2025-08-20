import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch17: Next.js API route examples for providers', () => {
  it('resend route adds Next.js API file', () => {
    const spec = generateSpike('gen-resend-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/email/send/route.ts');
  });

  it('sendgrid route adds Next.js API file', () => {
    const spec = generateSpike('gen-sendgrid-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/email/send/route.ts');
  });

  it('pusher route adds publish API', () => {
    const spec = generateSpike('gen-pusher-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/realtime/publish/route.ts');
  });

  it('ably route adds publish API', () => {
    const spec = generateSpike('gen-ably-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/realtime/publish/route.ts');
  });

  it('paypal route adds payments API', () => {
    const spec = generateSpike('gen-paypal-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/payments/create/route.ts');
  });

  it('launchdarkly route adds flags API', () => {
    const spec = generateSpike('gen-launchdarkly-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/flags/get/route.ts');
  });

  it('vault route adds secrets API', () => {
    const spec = generateSpike('gen-vault-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/secrets/get/route.ts');
  });
});


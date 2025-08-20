import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch12: Sentry/Stripe/PostHog/Shadcn/Supabase specializations', () => {
  it('sentry config adds init file', () => {
    const spec = generateSpike('gen-sentry-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/sentry/init.ts');
  });

  it('stripe client adds client file', () => {
    const spec = generateSpike('gen-stripe-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/stripe/client.ts');
  });

  it('posthog client adds analytics file', () => {
    const spec = generateSpike('gen-posthog-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/analytics/posthog.ts');
  });

  it('shadcn init adds ui button component', () => {
    const spec = generateSpike('gen-shadcn-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('components/ui/button.tsx');
  });

  it('supabase service advanced adds client and auth helpers', () => {
    const spec = generateSpike('gen-supabase-service-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/supabase/client.ts');
    expect(paths).toContain('src/supabase/auth.ts');
  });
});


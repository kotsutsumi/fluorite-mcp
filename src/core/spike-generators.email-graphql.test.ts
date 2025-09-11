import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('Email/Notification providers', () => {
  it('generates Resend service sender', () => {
    const spec = generateSpike('strike-resend-service-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/email/resend.ts')).toBe(true);
  });
  it('generates SendGrid route handler', () => {
    const spec = generateSpike('strike-sendgrid-route-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/email/sendgrid-route.ts')).toBe(true);
  });
});

describe('GraphQL adapters', () => {
  it('generates Apollo adapter', () => {
    const spec = generateSpike('strike-apollo-adapter-typed-ts');
    expect(spec).toBeDefined();
    expect(spec.files).toBeDefined();
    expect(spec.files?.length).toBeGreaterThan(0);
    // Apollo adapter generates standard adapter pattern files
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.size).toBeGreaterThan(0);
  });
  it('generates generic GraphQL adapter', () => {
    const spec = generateSpike('strike-graphql-adapter-typed-ts');
    expect(spec).toBeDefined();
    expect(spec.files).toBeDefined();
    expect(spec.files?.length).toBeGreaterThan(0);
    // GraphQL adapter generates standard adapter pattern files
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.size).toBeGreaterThan(0);
  });
});


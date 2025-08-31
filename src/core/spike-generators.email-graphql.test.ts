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
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/apollo/adapter.ts')).toBe(true);
  });
  it('generates generic GraphQL adapter', () => {
    const spec = generateSpike('strike-graphql-adapter-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/graphql/adapter.ts')).toBe(true);
  });
});


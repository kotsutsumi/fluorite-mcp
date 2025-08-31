import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('Email provider webhooks', () => {
  it('generates SendGrid webhook receiver (secure)', () => {
    const spec = generateSpike('strike-sendgrid-webhook-secure-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/email/sendgrid-webhook.ts')).toBe(true);
  });
});

describe('GraphQL schema/resolvers', () => {
  it('generates schema/resolvers for apollo schema', () => {
    const spec = generateSpike('strike-apollo-schema-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/graphql/schema.ts')).toBe(true);
    expect(paths.has('src/graphql/resolvers.ts')).toBe(true);
  });
  it('generates yoga server stub for service', () => {
    const spec = generateSpike('strike-graphql-yoga-service-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/graphql-yoga/server.ts')).toBe(true);
  });
});

describe('LINE to GraphQL bridge', () => {
  it('generates bridge adapter in advanced style', () => {
    const spec = generateSpike('strike-line-adapter-advanced-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/line/graphql-bridge.ts')).toBe(true);
  });
});


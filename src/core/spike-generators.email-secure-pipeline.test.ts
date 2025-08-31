import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('SendGrid secure webhook verification', () => {
  it('adds verify and secure webhook when style=secure', () => {
    const spec = generateSpike('strike-sendgrid-webhook-secure-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/email/sendgrid-verify.ts')).toBe(true);
    expect(paths.has('src/email/sendgrid-webhook.ts')).toBe(true);
  });
});

describe('LINE pipeline adapter', () => {
  it('adds line pipeline adapter in advanced style', () => {
    const spec = generateSpike('strike-line-adapter-advanced-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/line/pipeline.ts')).toBe(true);
  });
});


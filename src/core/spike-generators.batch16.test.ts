import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch16: Payments, Error tracking, KV/Discovery, Scheduler', () => {
  it('paypal client includes payments helper', () => {
    const spec = generateSpike('gen-paypal-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/payments/paypal.ts');
  });

  it('braintree client includes payments helper', () => {
    const spec = generateSpike('gen-braintree-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/payments/braintree.ts');
  });

  it('rollbar config includes monitoring helper', () => {
    const spec = generateSpike('gen-rollbar-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/monitoring/rollbar.ts');
  });

  it('consul config includes kv helper', () => {
    const spec = generateSpike('gen-consul-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/config/consul.ts');
  });

  it('etcd config includes kv helper', () => {
    const spec = generateSpike('gen-etcd-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/config/etcd.ts');
  });

  it('agenda job includes scheduler helper', () => {
    const spec = generateSpike('gen-agenda-job-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/jobs/agenda.ts');
  });
});


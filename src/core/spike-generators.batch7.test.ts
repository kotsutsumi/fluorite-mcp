import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch7: Fastify/Hono/RabbitMQ/NATS/SQS/SNS/Kinesis', () => {
  it('fastify service adds server', () => {
    const spec = generateSpike('gen-fastify-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/fastify/server.ts');
  });

  it('hono route adds server', () => {
    const spec = generateSpike('gen-hono-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/hono/server.ts');
  });

  it('rabbitmq service adds publisher/consumer', () => {
    const spec = generateSpike('gen-rabbitmq-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/rabbitmq/publisher.ts');
    expect(paths).toContain('src/rabbitmq/consumer.ts');
  });

  it('nats service adds pub/sub', () => {
    const spec = generateSpike('gen-nats-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/nats/pub.ts');
    expect(paths).toContain('src/nats/sub.ts');
  });

  it('sqs service adds sqs helper', () => {
    const spec = generateSpike('gen-sqs-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/aws/sqs.ts');
  });

  it('sns service adds sns publish helper', () => {
    const spec = generateSpike('gen-sns-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/aws/sns.ts');
  });

  it('kinesis service adds kinesis helper', () => {
    const spec = generateSpike('gen-kinesis-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/aws/kinesis.ts');
  });
});


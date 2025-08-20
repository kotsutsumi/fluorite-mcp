import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch6: OpenAI/LangChain/BullMQ/Lambda/Cypress', () => {
  it('openai client adds chat client', () => {
    const spec = generateSpike('gen-openai-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/openai/chat.ts');
  });

  it('langchain service adds basic chain', () => {
    const spec = generateSpike('gen-langchain-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/langchain/basic.ts');
  });

  it('bullmq service adds queue and worker', () => {
    const spec = generateSpike('gen-bullmq-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/queue/queue.ts');
    expect(paths).toContain('src/queue/worker.ts');
  });

  it('aws-lambda service adds handler', () => {
    const spec = generateSpike('gen-aws-lambda-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/lambda/handler.ts');
  });

  it('cypress config adds config and spec', () => {
    const spec = generateSpike('gen-cypress-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('cypress.config.ts');
    expect(paths).toContain('cypress/e2e/spec.cy.ts');
  });
});


import { describe, it, expect } from 'vitest';
import { scoreSpikeMatch, type SpikeMetadata, type SpikeSpec } from './spike-catalog.js';

describe('scoreSpikeMatch', () => {
  it('returns higher score when more task words are present (metadata)', () => {
    const meta: SpikeMetadata = {
      id: 'strike-bun-elysia-worker-typed-ts',
      name: 'Elysia Worker (Typed, TS)',
      description: 'Typed worker template for Bun Elysia with testing support',
      stack: ['bun', 'elysia', 'typescript'],
      tags: ['worker', 'typed', 'testing'],
      version: '1.0.0',
      fileCount: 3,
      patchCount: 1,
    };

    const taskWeak = 'create worker';
    const taskStrong = 'create typed worker for bun elysia in typescript with testing';

    const sWeak = scoreSpikeMatch(taskWeak, meta);
    const sStrong = scoreSpikeMatch(taskStrong, meta);

    expect(sStrong).toBeGreaterThan(sWeak);
    expect(sStrong).toBeGreaterThan(0);
  });

  it('is case-insensitive and tokenizes punctuation', () => {
    const spec: SpikeSpec = {
      id: 'strike-bun-elysia-plugin-secure-ts',
      name: 'Elysia Plugin Secure (TS)',
      description: 'Security-focused plugin with auth, rate-limit, helmet',
      stack: ['bun', 'elysia', 'typescript'],
      tags: ['plugin', 'secure', 'helmet', 'rate-limit'],
      version: '1.0.0',
      files: [],
      patches: [],
      params: [],
    };

    const task = 'Secure plugin for ELYSIA: add Helmet & rate-limit (TypeScript)';
    const score = scoreSpikeMatch(task, spec);
    expect(score).toBeGreaterThan(0);
  });

  it('maps common Japanese keywords to English tokens', () => {
    const spec: SpikeSpec = {
      id: 'strike-bun-elysia-plugin-secure-ts',
      name: 'Elysia Plugin Secure (TS)',
      description: 'Security-focused plugin with auth, rate-limit, helmet',
      stack: ['bun', 'elysia', 'typescript'],
      tags: ['plugin', 'secure', 'helmet', 'rate-limit'],
    } as SpikeSpec;

    const taskJa = 'Elysia のセキュアなプラグイン（TypeScript）を作成';
    const score = scoreSpikeMatch(taskJa, spec);
    expect(score).toBeGreaterThan(0);
  });

  it('returns 0 when no words match', () => {
    const meta: SpikeMetadata = {
      id: 'strike-bun-elysia-listener-basic-js',
      name: 'Elysia Listener Basic (JS)',
      description: 'Basic listener without extras',
      stack: ['bun', 'elysia', 'javascript'],
      tags: ['listener', 'basic'],
    } as SpikeMetadata;

    const score = scoreSpikeMatch('unrelated postgres schema migration', meta);
    expect(score).toBe(0);
  });
});

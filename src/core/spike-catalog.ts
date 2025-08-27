/**
 * Spike catalog utilities for template-driven spikes
 */

import { readdir, readFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { createLogger } from './logger.js';
import { listGeneratedSpikeIds, isGeneratedId, generateSpike, generateMetadata } from './spike-generators.js';

const log = createLogger('spike-catalog', 'fluorite-mcp');

// Simple LRU cache for loaded spikes
class SpikeCache {
  private cache = new Map<string, { spec: SpikeSpec; timestamp: number }>();
  private maxSize = 50; // Keep only 50 spikes in memory
  private maxAge = 300000; // 5 minutes TTL

  get(id: string): SpikeSpec | null {
    const entry = this.cache.get(id);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(id);
      return null;
    }
    
    return entry.spec;
  }

  set(id: string, spec: SpikeSpec): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(id, { spec, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const spikeCache = new SpikeCache();

// Lightweight spike metadata for indexing
export interface SpikeMetadata {
  id: string;
  name: string;
  description?: string;
  stack?: string[];
  tags?: string[];
  version?: string;
  fileCount?: number;
  patchCount?: number;
}

export interface SpikeParamDef {
  name: string;
  required?: boolean;
  description?: string;
  default?: string;
}

export interface SpikeFileTemplate {
  path: string;
  content?: string; // rendered content
  template?: string; // raw template with tokens like {{var}}
}

export interface SpikePatch {
  path: string;
  diff: string; // unified diff text
}

export interface SpikeSpec {
  id: string;
  name: string;
  version?: string;
  stack?: string[];
  tags?: string[];
  description?: string;
  params?: SpikeParamDef[];
  files?: SpikeFileTemplate[];
  patches?: SpikePatch[];
}

export interface SpikeCatalogConfig {
  baseDir: string; // directory that contains spike JSON files
}

export const DEFAULT_SPIKE_CONFIG: SpikeCatalogConfig = {
  baseDir: 'src/spikes'
};

export async function ensureSpikeDirectory(cfg: SpikeCatalogConfig = DEFAULT_SPIKE_CONFIG) {
  const dir = path.resolve(cfg.baseDir);
  try { await access(dir, constants.F_OK); }
  catch {
    await mkdir(dir, { recursive: true });
  }
}

export async function listSpikeIds(filter?: string, cfg: SpikeCatalogConfig = DEFAULT_SPIKE_CONFIG): Promise<string[]> {
  await ensureSpikeDirectory(cfg);
  const entries = await readdir(path.resolve(cfg.baseDir));
  let ids = entries
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/i, ''))
    .sort();

  // Merge generated spikes
  const genIds = listGeneratedSpikeIds();
  for (const id of genIds) {
    if (!ids.includes(id)) ids.push(id);
  }

  if (filter) {
    const re = new RegExp(filter, 'i');
    ids = ids.filter(id => re.test(id));
  }

  // Optional: limit how many spikes we expose (helps tests reduce memory usage)
  const limEnv = process.env.FLUORITE_SPIKE_LIST_LIMIT;
  const limit = limEnv ? parseInt(limEnv, 10) : NaN;
  if (!Number.isNaN(limit) && limit > 0) {
    ids = ids.slice(0, limit);
  }

  return ids;
}

export async function loadSpike(id: string, cfg: SpikeCatalogConfig = DEFAULT_SPIKE_CONFIG): Promise<SpikeSpec> {
  // Check cache first
  const cached = spikeCache.get(id);
  if (cached) {
    return cached;
  }

  // Prefer on-disk JSON if it exists (even for strike-* ids)
  const file = path.resolve(cfg.baseDir, `${id}.json`);
  try {
    await access(file, constants.F_OK);
    const raw = await readFile(file, 'utf-8');
    const spec = JSON.parse(raw) as SpikeSpec;
    if (!spec.id) spec.id = id;
    spikeCache.set(id, spec);
    return spec;
  } catch {
    // File does not exist; fall through to generated handling if applicable
  }

  // If no physical file, generated spikes are synthesized on the fly
  if (isGeneratedId(id)) {
    const spec = generateSpike(id);
    spikeCache.set(id, spec);
    return spec;
  }

  // If we get here, it's neither a file nor a recognizable generated id
  const err = new Error(`Spike not found: ${id}`);
  log.error('Failed to load spike (not found)', err, { id, file });
  throw err;
}

// Load only metadata from spike files for efficient indexing
export async function loadSpikeMetadata(id: string, cfg: SpikeCatalogConfig = DEFAULT_SPIKE_CONFIG): Promise<SpikeMetadata> {
  // Prefer metadata from on-disk JSON if present
  const file = path.resolve(cfg.baseDir, `${id}.json`);
  try {
    await access(file, constants.F_OK);
    const raw = await readFile(file, 'utf-8');
    const spec = JSON.parse(raw) as SpikeSpec;
    return {
      id: spec.id || id,
      name: spec.name || id,
      description: spec.description,
      stack: spec.stack,
      tags: spec.tags,
      version: spec.version,
      fileCount: spec.files?.length || 0,
      patchCount: spec.patches?.length || 0
    };
  } catch {
    // No physical file; use generated metadata if applicable
    if (isGeneratedId(id)) {
      return generateMetadata(id);
    }
    const err = new Error(`Spike not found: ${id}`);
    log.error('Failed to load spike metadata (not found)', err, { id, file });
    throw err;
  }
}

// Load metadata for multiple spikes with pagination
export async function loadSpikeMetadataBatch(
  ids: string[], 
  limit = 20, 
  offset = 0, 
  cfg: SpikeCatalogConfig = DEFAULT_SPIKE_CONFIG
): Promise<SpikeMetadata[]> {
  const paginatedIds = ids.slice(offset, offset + limit);
  const metadata: SpikeMetadata[] = [];
  
  for (const id of paginatedIds) {
    try {
      const meta = await loadSpikeMetadata(id, cfg);
      metadata.push(meta);
    } catch (e) {
      log.warn('Failed to load spike metadata', { errorMessage: (e as Error).message, id });
      // Continue with other spikes instead of failing completely
    }
  }
  
  return metadata;
}

export function renderTemplateString(input: string, params: Record<string, string>): string {
  return input.replace(/\{\{\s*([a-zA-Z0-9_\-]+)\s*\}\}/g, (_m, p1) => {
    const key = String(p1);
    return params[key] ?? '';
  });
}

export function renderFiles(files: SpikeFileTemplate[] | undefined, params: Record<string, string>): SpikeFileTemplate[] {
  if (!files) return [];
  return files.map(f => ({
    path: renderTemplateString(f.path, params),
    content: f.content ? renderTemplateString(f.content, params) : (f.template ? renderTemplateString(f.template, params) : ''),
    template: undefined
  }));
}

export function scoreSpikeMatch(task: string, spec: SpikeSpec): number;
export function scoreSpikeMatch(task: string, meta: SpikeMetadata): number;
export function scoreSpikeMatch(task: string, specOrMeta: SpikeSpec | SpikeMetadata): number {
  const hay = `${specOrMeta.id} ${specOrMeta.name} ${(specOrMeta.stack||[]).join(' ')} ${(specOrMeta.tags||[]).join(' ')} ${specOrMeta.description||''}`.toLowerCase();

  // Tokenize task with basic latin split + lightweight JP keyword mapping
  const words = tokenizeTask(task);
  if (words.length === 0) return 0;
  const hits = words.reduce((acc,w)=> acc + (hay.includes(w) ? 1 : 0), 0);
  return hits / words.length; // simple ratio 0..1
}

function tokenizeTask(task: string): string[] {
  const lower = task.toLowerCase();
  let words = lower.split(/[^a-z0-9_@#:+.-]+/i).filter(Boolean);

  // Lightweight JP→EN keywords（and some EN synonyms→canonical tokens）
  // intentionally small to keep logic fast and predictable.
  const jpHints: Array<[RegExp, string]> = [
    [/セキュア|安全|安全化/, 'secure'],
    [/型付|型付き|型安全/, 'typed'],
    [/プラグイン/, 'plugin'],
    [/ワーカー/, 'worker'],
    [/リスナー/, 'listener'],
    [/移行|マイグレーション/, 'migration'],
    [/シード|seed/i, 'seed'],
    [/テスト|試験|検証/, 'testing'],
    [/プレビュー/, 'preview'],
    [/適用/, 'apply'],
    [/コンポーネント/, 'component'],
    [/フック/, 'hook'],
    [/プロバイダ|プロバイダー/, 'provider'],
    [/設定|コンフィグ|config/i, 'config'],
    [/typescript|タイプスクリプト/, 'typescript'],
    [/javascript|ジャバスクリプト|js/i, 'js'],
    [/python|パイソン|py/i, 'py'],
    [/rust|ラスティ|rs/i, 'rs'],
    [/go|ゴー言語|golang/i, 'go'],
    [/bun/i, 'bun'],
    [/elysia/i, 'elysia'],
    [/next\.?js|\bnext\b|app\s*router|rsc/i, 'nextjs'],
    [/react/i, 'react'],
    [/trpc/i, 'trpc'],
    [/hono/i, 'hono'],
    [/graphql|apollo|urql|relay/i, 'graphql'],
    [/zod/i, 'zod'],
    [/react[- ]?hook[- ]?form|rhf/i, 'react-hook-form'],
    [/radix[- ]?ui/i, 'radix-ui'],
    [/tailwind|tailwindcss/i, 'tailwindcss'],
    [/storybook/i, 'storybook'],
    [/nx\b/i, 'nx'],
    [/turborepo|turbo\b/i, 'turborepo'],
    [/fastapi|ファストapi/i, 'fastapi'],
    [/api|エンドポイント/i, 'route'],
    [/認証|oauth|認可|ログイン/i, 'auth'],
    [/next-?auth/i, 'next-auth'],
    [/auth0/i, 'auth0'],
    [/clerk/i, 'clerk'],
    [/lucia/i, 'lucia'],
    [/prisma/i, 'prisma'],
    [/drizzle/i, 'drizzle'],
    [/スキーマ|schema/i, 'schema']
    ,[/postgres|postgre|psql/i, 'postgres']
    ,[/mysql/i, 'mysql']
    ,[/sqlite/i, 'sqlite']
    ,[/redis/i, 'redis']
    ,[/vitest/i, 'vitest']
    ,[/jest/i, 'jest']
    ,[/playwright/i, 'playwright']
    ,[/cypress/i, 'cypress']
    ,[/oauth2?|oidc/i, 'auth']
    ,[/supabase[- ]?auth|supabase/i, 'supabase']
    ,[/stripe/i, 'stripe']
    ,[/sentry/i, 'sentry']
    ,[/posthog/i, 'posthog']
    ,[/shadcn/i, 'shadcn']
    ,[/prometheus/i, 'prometheus']
    ,[/pino/i, 'pino']
    ,[/winston/i, 'winston']
    ,[/datadog/i, 'datadog']
    ,[/new\s?relic|newrelic/i, 'newrelic']
    ,[/opensearch/i, 'opensearch']
    ,[/elasticsearch|es\b/i, 'elasticsearch']
    ,[/検索|サーチ/i, 'search']
    ,[/監視|モニタリング|apm|オブザーバビリティ/i, 'monitoring']
    ,[/ログ|logging|log/i, 'log']
    ,[/メトリクス|metrics|prometheus/i, 'prometheus']
    ,[/決済|支払い|課金/i, 'payments']
    ,[/ストレージ|保存|オブジェクトストレージ/i, 'storage']
    ,[/s3\b/i, 's3']
    ,[/gcs|google\s*cloud\s*storage/i, 'gcs']
    ,[/azure\s*blob/i, 'azure-blob']
    ,[/minio/i, 'minio']
    ,[/sentry/i, 'sentry']
    ,[/posthog/i, 'posthog']
    ,[/newrelic|new\s*relic/i, 'newrelic']
    ,[/pino/i, 'pino']
    ,[/winston/i, 'winston']
    ,[/meili(search)?/i, 'meilisearch']
    ,[/typesense/i, 'typesense']
    ,[/algolia/i, 'algolia']
    ,[/stripe/i, 'stripe']
    ,[/paddle/i, 'paddle']
  ];

  const hintWords: string[] = [];
  for (const [re, kw] of jpHints) {
    if (re.test(lower)) hintWords.push(kw);
  }

  // Merge and uniq
  if (hintWords.length) {
    words = Array.from(new Set([...words, ...hintWords]));
  }

  return Array.from(new Set(words));
}

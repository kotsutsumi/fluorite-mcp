/**
 * Spike catalog utilities for template-driven spikes
 */

import { readdir, readFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { createLogger } from './logger.js';

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
  const ids = entries
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/i, ''))
    .sort();
  if (!filter) return ids;
  const re = new RegExp(filter, 'i');
  return ids.filter(id => re.test(id));
}

export async function loadSpike(id: string, cfg: SpikeCatalogConfig = DEFAULT_SPIKE_CONFIG): Promise<SpikeSpec> {
  // Check cache first
  const cached = spikeCache.get(id);
  if (cached) {
    return cached;
  }

  const file = path.resolve(cfg.baseDir, `${id}.json`);
  const raw = await readFile(file, 'utf-8');
  try {
    const spec = JSON.parse(raw) as SpikeSpec;
    if (!spec.id) spec.id = id;
    
    // Cache the loaded spike
    spikeCache.set(id, spec);
    
    return spec;
  } catch (e) {
    log.error('Failed to parse spike JSON', e as Error, { id, file });
    throw e;
  }
}

// Load only metadata from spike files for efficient indexing
export async function loadSpikeMetadata(id: string, cfg: SpikeCatalogConfig = DEFAULT_SPIKE_CONFIG): Promise<SpikeMetadata> {
  const file = path.resolve(cfg.baseDir, `${id}.json`);
  const raw = await readFile(file, 'utf-8');
  try {
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
  } catch (e) {
    log.error('Failed to parse spike JSON metadata', e as Error, { id, file });
    throw e;
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
  const words = Array.from(new Set(task.toLowerCase().split(/[^a-z0-9_@#:+.-]+/i))).filter(Boolean);
  if (words.length === 0) return 0;
  const hits = words.reduce((acc,w)=> acc + (hay.includes(w) ? 1 : 0), 0);
  return hits / words.length; // simple ratio 0..1
}


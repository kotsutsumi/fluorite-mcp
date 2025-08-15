/**
 * Spike catalog utilities for template-driven spikes
 */

import { readdir, readFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { createLogger } from './logger.js';

const log = createLogger('spike-catalog', 'fluorite-mcp');

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
  const file = path.resolve(cfg.baseDir, `${id}.json`);
  const raw = await readFile(file, 'utf-8');
  try {
    const spec = JSON.parse(raw) as SpikeSpec;
    if (!spec.id) spec.id = id;
    return spec;
  } catch (e) {
    log.error('Failed to parse spike JSON', e as Error, { id, file });
    throw e;
  }
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

export function scoreSpikeMatch(task: string, spec: SpikeSpec): number {
  const hay = `${spec.id} ${spec.name} ${(spec.stack||[]).join(' ')} ${(spec.tags||[]).join(' ')} ${spec.description||''}`.toLowerCase();
  const words = Array.from(new Set(task.toLowerCase().split(/[^a-z0-9_@#:+.-]+/i))).filter(Boolean);
  if (words.length === 0) return 0;
  const hits = words.reduce((acc,w)=> acc + (hay.includes(w) ? 1 : 0), 0);
  return hits / words.length; // simple ratio 0..1
}


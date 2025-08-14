/**
 * Core catalog functions for fluorite-mcp
 * Pure functions that can be unit tested independently of MCP protocol
 */

import { readFile, writeFile, readdir, mkdir, access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { ValidationError, FileSystemError } from "../types.js";

export interface CatalogConfig {
  readonly baseDir: string;
  readonly supportedExtensions: readonly string[];
  readonly maxFileSize: number;
  readonly maxFilenameLength: number;
  readonly encoding: BufferEncoding;
}

export const DEFAULT_CONFIG: CatalogConfig = {
  baseDir: "src/catalog",
  supportedExtensions: [".yaml", ".yml", ".json"],
  maxFileSize: 1024 * 1024, // 1MB
  maxFilenameLength: 255,
  encoding: "utf-8"
} as const;

/**
 * Sanitize package name for safe filesystem usage
 */
export function sanitizePackageName(pkg: string, config: CatalogConfig = DEFAULT_CONFIG): string {
  if (typeof pkg !== "string" || !pkg.trim()) {
    throw new ValidationError("Package name must be a non-empty string");
  }
  
  const sanitized = String(pkg)
    .trim()
    .replace(/\/+/g, "__")
    .replace(/[^a-zA-Z0-9._@-]/g, "_");
    
  if (sanitized.length > config.maxFilenameLength) {
    throw new ValidationError(
      `Package name too long: ${sanitized.length} > ${config.maxFilenameLength}`
    );
  }
  
  return sanitized;
}

/**
 * Ensure catalog directory exists
 */
export async function ensureCatalogDirectory(config: CatalogConfig = DEFAULT_CONFIG): Promise<void> {
  const catalogPath = path.resolve(config.baseDir);
  try {
    await access(catalogPath, constants.F_OK);
  } catch {
    try {
      await mkdir(catalogPath, { recursive: true });
    } catch (error) {
      throw new FileSystemError(
        `Failed to create catalog directory: ${catalogPath}`,
        error as Error
      );
    }
  }
}

/**
 * Validate file size
 */
export async function validateFileSize(filePath: string, config: CatalogConfig = DEFAULT_CONFIG): Promise<void> {
  try {
    const stats = await stat(filePath);
    if (stats.size > config.maxFileSize) {
      throw new ValidationError(
        `File too large: ${stats.size} bytes > ${config.maxFileSize} bytes`
      );
    }
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== "ENOENT") {
      throw new FileSystemError(
        `Failed to validate file size: ${filePath}`,
        error as Error
      );
    }
    // File doesn't exist yet, which is fine for validation
  }
}

/**
 * Read package specification from catalog
 */
export async function readSpec(pkg: string, config: CatalogConfig = DEFAULT_CONFIG): Promise<string> {
  const safe = sanitizePackageName(pkg, config);
  const base = path.resolve(config.baseDir);
  
  for (const ext of config.supportedExtensions) {
    const filePath = path.join(base, safe + ext);
    try {
      await validateFileSize(filePath, config);
      const content = await readFile(filePath, config.encoding);
      
      if (!content.trim()) {
        continue; // Skip empty files
      }
      
      return content;
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== "ENOENT") {
        throw new FileSystemError(
          `Failed to read spec for ${pkg}: ${nodeError.message}`,
          error as Error
        );
      }
      // Continue to next extension
    }
  }
  
  throw new FileSystemError(`Package specification not found: ${pkg}`);
}

/**
 * Write package specification to catalog
 */
export async function writeSpec(
  pkg: string, 
  content: string, 
  config: CatalogConfig = DEFAULT_CONFIG
): Promise<string> {
  if (content.length > config.maxFileSize) {
    throw new ValidationError(
      `Content too large: ${content.length} bytes > ${config.maxFileSize} bytes`
    );
  }
  
  const safe = sanitizePackageName(pkg, config);
  await ensureCatalogDirectory(config);
  
  const filePath = path.resolve(config.baseDir, safe + ".yaml");
  
  try {
    await writeFile(filePath, content, config.encoding);
    return filePath;
  } catch (error) {
    throw new FileSystemError(
      `Failed to write spec for ${pkg}`,
      error as Error
    );
  }
}

/**
 * List all package specifications in catalog
 */
export async function listSpecs(
  filter?: string, 
  config: CatalogConfig = DEFAULT_CONFIG
): Promise<string[]> {
  try {
    await ensureCatalogDirectory(config);
    const catalogPath = path.resolve(config.baseDir);
    const files = await readdir(catalogPath);
    
    let packageNames = files
      .filter(file => config.supportedExtensions.some(ext => file.endsWith(ext)))
      .map(file => file.replace(/\.(yaml|yml|json)$/i, "").replace(/__/g, "/"))
      .sort();
    
    // Apply filter if provided
    if (filter) {
      const filterRegex = new RegExp(filter, "i");
      packageNames = packageNames.filter(name => filterRegex.test(name));
    }
    
    return packageNames;
  } catch (error) {
    throw new FileSystemError(
      "Failed to list package specifications",
      error as Error
    );
  }
}

/**
 * Get file extension for package name
 */
export async function getSpecExtension(
  pkg: string, 
  config: CatalogConfig = DEFAULT_CONFIG
): Promise<string | null> {
  const safe = sanitizePackageName(pkg, config);
  const base = path.resolve(config.baseDir);
  
  for (const ext of config.supportedExtensions) {
    const filePath = path.join(base, safe + ext);
    try {
      await access(filePath, constants.F_OK);
      return ext;
    } catch {
      // Continue to next extension
    }
  }
  
  return null;
}

/**
 * Delete package specification from catalog
 */
export async function deleteSpec(
  pkg: string, 
  config: CatalogConfig = DEFAULT_CONFIG
): Promise<boolean> {
  const safe = sanitizePackageName(pkg, config);
  const base = path.resolve(config.baseDir);
  
  for (const ext of config.supportedExtensions) {
    const filePath = path.join(base, safe + ext);
    try {
      const { unlink } = await import("node:fs/promises");
      await unlink(filePath);
      return true;
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== "ENOENT") {
        throw new FileSystemError(
          `Failed to delete spec for ${pkg}`,
          error as Error
        );
      }
      // Continue to next extension
    }
  }
  
  return false; // Not found
}

/**
 * Check if package specification exists
 */
export async function specExists(
  pkg: string, 
  config: CatalogConfig = DEFAULT_CONFIG
): Promise<boolean> {
  try {
    const ext = await getSpecExtension(pkg, config);
    return ext !== null;
  } catch {
    return false;
  }
}

/**
 * Get catalog statistics
 */
export interface CatalogStats {
  totalSpecs: number;
  specsByExtension: Record<string, number>;
  catalogPath: string;
  lastUpdated?: Date;
}

export async function getCatalogStats(
  config: CatalogConfig = DEFAULT_CONFIG
): Promise<CatalogStats> {
  try {
    await ensureCatalogDirectory(config);
    const catalogPath = path.resolve(config.baseDir);
    const files = await readdir(catalogPath);
    
    const specFiles = files.filter(file => 
      config.supportedExtensions.some(ext => file.endsWith(ext))
    );
    
    const specsByExtension: Record<string, number> = {};
    for (const ext of config.supportedExtensions) {
      specsByExtension[ext] = specFiles.filter(file => file.endsWith(ext)).length;
    }
    
    // Get directory stats for last modified
    let lastUpdated: Date | undefined;
    try {
      const dirStats = await stat(catalogPath);
      lastUpdated = dirStats.mtime;
    } catch {
      // Ignore if we can't get stats
    }
    
    return {
      totalSpecs: specFiles.length,
      specsByExtension,
      catalogPath,
      lastUpdated
    };
  } catch (error) {
    throw new FileSystemError(
      "Failed to get catalog statistics",
      error as Error
    );
  }
}
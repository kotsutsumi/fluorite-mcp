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
 * Sanitizes a package name for safe filesystem usage by replacing invalid characters
 * and enforcing length limits. Handles npm-style scoped packages and special characters.
 * 
 * @param pkg - The package name to sanitize (e.g., "@mui/x-data-grid", "react-router-dom")
 * @param config - Optional catalog configuration for validation limits
 * @returns The sanitized package name safe for filesystem usage (e.g., "@mui__x-data-grid")
 * @throws {ValidationError} When package name is empty, not a string, or exceeds length limits
 * 
 * @example
 * ```typescript
 * const safe = sanitizePackageName("@tanstack/react-query");
 * // Returns: "@tanstack__react-query"
 * 
 * const invalid = sanitizePackageName("package/with/special!chars");
 * // Returns: "package__with__special_chars"
 * ```
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
 * Ensures the catalog directory exists, creating it recursively if needed.
 * This function is idempotent and safe to call multiple times.
 * 
 * @param config - Optional catalog configuration containing the base directory path
 * @throws {FileSystemError} When directory creation fails due to permissions or disk space
 * 
 * @example
 * ```typescript
 * await ensureCatalogDirectory();
 * // Ensures ./src/catalog directory exists
 * 
 * await ensureCatalogDirectory({ ...DEFAULT_CONFIG, baseDir: "./custom-catalog" });
 * // Ensures ./custom-catalog directory exists
 * ```
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
 * Validates that a file's size is within the configured limits.
 * Non-existent files are considered valid (useful for pre-write validation).
 * 
 * @param filePath - Absolute or relative path to the file to validate
 * @param config - Optional catalog configuration containing the maximum file size limit
 * @throws {ValidationError} When file exists and exceeds the maximum size limit
 * @throws {FileSystemError} When file system operations fail (excluding ENOENT)
 * 
 * @example
 * ```typescript
 * await validateFileSize("./spec.yaml");
 * // Validates spec.yaml is under 1MB (default limit)
 * 
 * await validateFileSize("./large-spec.yaml", { ...DEFAULT_CONFIG, maxFileSize: 5 * 1024 * 1024 });
 * // Validates with custom 5MB limit
 * ```
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
 * Reads a package specification from the catalog, trying multiple file extensions.
 * Automatically skips empty files and returns the first valid specification found.
 * 
 * @param pkg - The package name to read (will be sanitized automatically)
 * @param config - Optional catalog configuration for file locations and extensions
 * @returns The raw specification content as a string
 * @throws {FileSystemError} When no specification file is found or reading fails
 * @throws {ValidationError} When file size validation fails
 * 
 * @example
 * ```typescript
 * const spec = await readSpec("@types/node");
 * // Searches for @types__node.yaml, @types__node.yml, @types__node.json
 * // Returns the content of the first existing, non-empty file
 * 
 * const customSpec = await readSpec("my-package", {
 *   ...DEFAULT_CONFIG,
 *   supportedExtensions: [".json", ".yaml"]
 * });
 * ```
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
 * Writes a package specification to the catalog as a YAML file.
 * Automatically creates the catalog directory if it doesn't exist.
 * 
 * @param pkg - The package name (will be sanitized for filesystem safety)
 * @param content - The specification content to write (YAML, JSON, or any text)
 * @param config - Optional catalog configuration for file location and size limits
 * @returns The absolute path to the written file
 * @throws {ValidationError} When content exceeds maximum file size or package name is invalid
 * @throws {FileSystemError} When directory creation or file writing fails
 * 
 * @example
 * ```typescript
 * const filePath = await writeSpec("react", `
 * name: react
 * version: 18.2.0
 * description: A JavaScript library for building user interfaces
 * `);
 * // Writes to ./src/catalog/react.yaml
 * // Returns: "/absolute/path/to/src/catalog/react.yaml"
 * 
 * const scopedPath = await writeSpec("@types/node", nodeTypeSpec);
 * // Writes to ./src/catalog/@types__node.yaml
 * ```
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
 * Lists all package specifications in the catalog, with optional filtering.
 * Returns package names in their original format (unsanitized).
 * 
 * @param filter - Optional regex pattern to filter package names (case-insensitive)
 * @param config - Optional catalog configuration for directory and file extensions
 * @returns Array of package names sorted alphabetically, with original scoped naming
 * @throws {FileSystemError} When catalog directory cannot be read
 * 
 * @example
 * ```typescript
 * const allSpecs = await listSpecs();
 * // Returns: ["@types/node", "react", "vue", "webpack"]
 * 
 * const reactSpecs = await listSpecs("react");
 * // Returns: ["react", "react-dom", "react-router"]
 * 
 * const scopedSpecs = await listSpecs("^@types");
 * // Returns: ["@types/node", "@types/react"]
 * ```
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
 * Determines the file extension of an existing package specification.
 * Checks all supported extensions and returns the first match found.
 * 
 * @param pkg - The package name to check (will be sanitized automatically)
 * @param config - Optional catalog configuration for file extensions and location
 * @returns The file extension including the dot (e.g., ".yaml", ".json") or null if not found
 * 
 * @example
 * ```typescript
 * const ext = await getSpecExtension("react");
 * // Returns: ".yaml" (if react.yaml exists)
 * // Returns: ".json" (if only react.json exists)
 * // Returns: null (if no react specification exists)
 * 
 * // Useful for determining file format before reading
 * if (await getSpecExtension("@types/node") === ".json") {
 *   const spec = JSON.parse(await readSpec("@types/node"));
 * }
 * ```
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
 * Deletes a package specification from the catalog.
 * Attempts to delete files with all supported extensions.
 * 
 * @param pkg - The package name to delete (will be sanitized automatically)
 * @param config - Optional catalog configuration for file extensions and location
 * @returns true if a file was deleted, false if no specification was found
 * @throws {FileSystemError} When file deletion fails (excluding file not found)
 * 
 * @example
 * ```typescript
 * const deleted = await deleteSpec("old-package");
 * if (deleted) {
 *   console.log("Package specification removed");
 * } else {
 *   console.log("Package specification not found");
 * }
 * 
 * // Safe to call on non-existent packages
 * await deleteSpec("non-existent-package"); // Returns false, no error
 * ```
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
 * Checks if a package specification exists in the catalog.
 * This is a convenience function that wraps getSpecExtension.
 * 
 * @param pkg - The package name to check (will be sanitized automatically)
 * @param config - Optional catalog configuration for file extensions and location
 * @returns true if any specification file exists, false otherwise
 * 
 * @example
 * ```typescript
 * if (await specExists("react")) {
 *   const spec = await readSpec("react");
 *   // Process the specification
 * } else {
 *   console.log("React specification not found");
 * }
 * 
 * // Useful for conditional operations
 * const packages = ["react", "vue", "angular"];
 * const existing = await Promise.all(
 *   packages.map(async pkg => ({
 *     name: pkg,
 *     exists: await specExists(pkg)
 *   }))
 * );
 * ```
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
 * Comprehensive statistics about the catalog contents and status.
 * Includes total counts, breakdown by file extension, and metadata.
 */
export interface CatalogStats {
  /** Total number of specification files in the catalog */
  totalSpecs: number;
  /** Count of specifications grouped by file extension */
  specsByExtension: Record<string, number>;
  /** Absolute path to the catalog directory */
  catalogPath: string;
  /** Last modification time of the catalog directory, if available */
  lastUpdated?: Date;
}

/**
 * Generates comprehensive statistics about the catalog contents and status.
 * Provides detailed breakdown of specifications by file type and metadata.
 * 
 * @param config - Optional catalog configuration for directory location and file extensions
 * @returns Detailed statistics object with counts, paths, and timestamps
 * @throws {FileSystemError} When catalog directory cannot be accessed or read
 * 
 * @example
 * ```typescript
 * const stats = await getCatalogStats();
 * console.log(`Total specifications: ${stats.totalSpecs}`);
 * console.log(`YAML files: ${stats.specsByExtension[".yaml"]}`);
 * console.log(`JSON files: ${stats.specsByExtension[".json"]}`);
 * console.log(`Catalog location: ${stats.catalogPath}`);
 * 
 * if (stats.lastUpdated) {
 *   console.log(`Last updated: ${stats.lastUpdated.toISOString()}`);
 * }
 * 
 * // Monitor catalog growth over time
 * const hourlyStats = await getCatalogStats();
 * // Store for trend analysis
 * ```
 */
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
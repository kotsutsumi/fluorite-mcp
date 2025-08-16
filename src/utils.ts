/**
 * Legacy utility functions for fluorite-mcp server
 * 
 * @deprecated Most functions in this module have been superseded by more
 * advanced implementations in the core modules. Use the catalog and handlers
 * modules for new development.
 * 
 * @see {@link ./core/catalog.js} - For file system operations
 * @see {@link ./core/handlers.js} - For MCP protocol utilities
 */

import { readFile, writeFile, readdir, mkdir, access, stat } from "node:fs/promises";
import { createRequire } from 'node:module';
import path from "node:path";
import { constants } from "node:fs";
import { ValidationError, FileSystemError, type ServerConfig } from "./types.js";

/**
 * Package version utility
 */
export function getPackageVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json');
    return typeof pkg?.version === 'string' ? pkg.version : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Configuration constants
 */
export const CONFIG: ServerConfig = {
  CATALOG_DIR: "src/catalog",
  SUPPORTED_EXTENSIONS: [".yaml", ".yml", ".json"],
  ENCODING: "utf-8",
  MAX_FILENAME_LENGTH: 255,
  MAX_FILE_SIZE: 1024 * 1024 // 1MB limit
} as const;

/**
 * Sanitize package name for safe file system usage
 * 
 * @deprecated Use `sanitizePackageName` from `./core/catalog.js` instead.
 * This function is maintained for backward compatibility but lacks the advanced
 * configuration options available in the catalog implementation.
 * 
 * @see {@link ./core/catalog.js#sanitizePackageName}
 */
export const sanitizePackageName = (pkg: string): string => {
  if (typeof pkg !== "string" || !pkg.trim()) {
    throw new ValidationError("Package name must be a non-empty string");
  }
  
  const sanitized = String(pkg)
    .trim()
    .replace(/\/+/g, "__")
    .replace(/[^a-zA-Z0-9._@-]/g, "_");
    
  if (sanitized.length > CONFIG.MAX_FILENAME_LENGTH) {
    throw new ValidationError(
      `Package name too long: ${sanitized.length} > ${CONFIG.MAX_FILENAME_LENGTH}`
    );
  }
  
  return sanitized;
};

/**
 * Ensure catalog directory exists
 * 
 * @deprecated Use `ensureCatalogDirectory` from `./core/catalog.js` instead.
 * This function uses hardcoded configuration while the catalog version supports
 * configurable directory paths and advanced error handling.
 * 
 * @see {@link ./core/catalog.js#ensureCatalogDirectory}
 */
export const ensureCatalogDirectory = async (): Promise<void> => {
  const catalogPath = path.resolve(CONFIG.CATALOG_DIR);
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
};

/**
 * Validate file size before processing
 * 
 * @deprecated Use `validateFileSize` from `./core/catalog.js` instead.
 * This function uses hardcoded limits while the catalog version supports
 * configurable size limits and enhanced validation.
 * 
 * @see {@link ./core/catalog.js#validateFileSize}
 */
export const validateFileSize = async (filePath: string): Promise<void> => {
  try {
    const stats = await stat(filePath);
    if (stats.size > CONFIG.MAX_FILE_SIZE) {
      throw new ValidationError(
        `File too large: ${stats.size} bytes > ${CONFIG.MAX_FILE_SIZE} bytes`
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
    // File doesn't exist yet, which is fine
  }
};

/**
 * Safe file read with error handling
 */
export const readFileContent = async (filePath: string): Promise<string> => {
  try {
    await validateFileSize(filePath);
    const content = await readFile(filePath, CONFIG.ENCODING);
    
    if (!content.trim()) {
      console.warn(`Empty file found: ${filePath}`);
    }
    
    return content;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      throw new FileSystemError(`File not found: ${filePath}`);
    }
    throw new FileSystemError(
      `Failed to read file: ${filePath}`,
      error as Error
    );
  }
};

/**
 * Safe file write with validation
 */
export const writeFileContent = async (filePath: string, content: string): Promise<void> => {
  if (content.length > CONFIG.MAX_FILE_SIZE) {
    throw new ValidationError(
      `Content too large: ${content.length} bytes > ${CONFIG.MAX_FILE_SIZE} bytes`
    );
  }
  
  try {
    await ensureCatalogDirectory();
    await writeFile(filePath, content, CONFIG.ENCODING);
  } catch (error) {
    throw new FileSystemError(
      `Failed to write file: ${filePath}`,
      error as Error
    );
  }
};

/**
 * List files in catalog directory with filtering
 */
export const listCatalogFiles = async (filter?: string): Promise<string[]> => {
  try {
    await ensureCatalogDirectory();
    const catalogPath = path.resolve(CONFIG.CATALOG_DIR);
    const files = await readdir(catalogPath);
    
    let filteredFiles = files
      .filter(file => CONFIG.SUPPORTED_EXTENSIONS.some(ext => file.endsWith(ext)))
      .map(file => file.replace(/\.(yaml|yml|json)$/i, "").replace(/__/g, "/"))
      .sort();
    
    if (filter) {
      const filterRegex = new RegExp(filter, "i");
      filteredFiles = filteredFiles.filter(name => filterRegex.test(name));
    }
    
    return filteredFiles;
  } catch (error) {
    throw new FileSystemError(
      "Failed to list catalog files",
      error as Error
    );
  }
};

/**
 * Get MIME type for file extension
 * 
 * @deprecated Use `getMimeType` from `./core/handlers.js` instead.
 * This function is maintained for backward compatibility but the handlers
 * version is the canonical implementation used by the MCP protocol.
 * 
 * @see {@link ./core/handlers.js#getMimeType}
 */
export const getMimeType = (extension: string): string => {
  return extension === ".json" ? "application/json" : "text/yaml";
};

/**
 * Create standardized error response for resources
 */
export const createResourceErrorResponse = (error: Error, uri: string) => {
  console.error("Resource error occurred:", error);
  
  return {
    contents: [{
      uri,
      text: error instanceof ValidationError || error instanceof FileSystemError
        ? error.message
        : `Error: ${error.message}`
    }]
  };
};

/**
 * Create standardized error response for tools
 */
export const createToolErrorResponse = (error: Error) => {
  console.error("Tool error occurred:", error);
  
  return {
    content: [{
      type: "text" as const,
      text: error instanceof ValidationError || error instanceof FileSystemError
        ? error.message
        : `Error: ${error.message}`
    }],
    isError: true
  };
};
/**
 * Utility functions for fluorite-mcp server
 */

import { readFile, writeFile, readdir, mkdir, access, stat } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";
import { ValidationError, FileSystemError, type ServerConfig } from "./types.js";

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
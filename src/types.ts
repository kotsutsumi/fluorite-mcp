/**
 * Type definitions for fluorite-mcp server
 */

export interface ServerConfig {
  readonly CATALOG_DIR: string;
  readonly SUPPORTED_EXTENSIONS: readonly string[];
  readonly ENCODING: "utf-8";
  readonly MAX_FILENAME_LENGTH: number;
  readonly MAX_FILE_SIZE: number;
}

export interface PackageSpec {
  readonly name: string;
  readonly content: string;
  readonly format: "yaml" | "yml" | "json";
  readonly filePath: string;
}

export interface ServerInfo {
  readonly name: string;
  readonly version: string;
  readonly catalogDir: string;
  readonly supportedFormats: readonly string[];
  readonly uptime: number;
}

export interface ListSpecsOptions {
  readonly filter?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface UpsertSpecOptions {
  readonly pkg: string;
  readonly yaml: string;
  readonly overwrite?: boolean;
}

/**
 * Error types for better error handling
 */
export class FluoriteError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "FluoriteError";
  }
}

export class ValidationError extends FluoriteError {
  constructor(message: string, cause?: Error) {
    super(message, "VALIDATION_ERROR", cause);
    this.name = "ValidationError";
  }
}

export class FileSystemError extends FluoriteError {
  constructor(message: string, cause?: Error) {
    super(message, "FILESYSTEM_ERROR", cause);
    this.name = "FileSystemError";
  }
}
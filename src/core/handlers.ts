/**
 * MCP handler functions for fluorite-mcp
 * These functions implement the MCP protocol contract and can be tested independently
 */

import { readSpec, writeSpec, listSpecs, getCatalogStats, type CatalogConfig, DEFAULT_CONFIG } from "./catalog.js";
import { ValidationError, FileSystemError } from "../types.js";
import { createLogger, performanceMonitor } from "./logger.js";

// Create namespaced loggers for different handler operations
const resourceLogger = createLogger('resource', 'handlers');
const toolLogger = createLogger('tool', 'handlers');
const diagnosticLogger = createLogger('diagnostic', 'handlers');

/**
 * Native MCP response types (compatible with SDK)
 */

/**
 * Get MIME type for file extension
 */
export function getMimeType(extension: string): string {
  return extension === ".json" ? "application/json" : "text/yaml";
}

/**
 * Handle spec resource requests
 * Implements: spec://{pkg}
 */
export async function handleSpecResource(
  pkg: string | string[],
  config: CatalogConfig = DEFAULT_CONFIG
) {
  const packageName = Array.isArray(pkg) ? pkg[0] : pkg;
  
  return await resourceLogger.time(`read-resource:${packageName || 'unknown'}`, async () => {
    try {
      resourceLogger.debug('Resource request received', { 
        packageName,
        operation: 'read-resource' 
      });

      if (!packageName) {
        const error = new ValidationError("Package name is required");
        resourceLogger.warn('Invalid resource request: empty package name', {
          operation: 'read-resource'
        });
        throw error;
      }
      
      const content = await readSpec(packageName, config);
      const extension = await import("./catalog.js").then(m => m.getSpecExtension(packageName, config));
      
      resourceLogger.info('Resource request completed successfully', {
        packageName,
        operation: 'read-resource',
        contentLength: content.length,
        mimeType: extension ? getMimeType(extension) : "text/yaml"
      });
      
      return {
        contents: [{
          uri: `spec://${packageName}`,
          text: content,
          mimeType: extension ? getMimeType(extension) : "text/yaml"
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof ValidationError || error instanceof FileSystemError
        ? error.message
        : `Error reading specification: ${error instanceof Error ? error.message : "Unknown error"}`;
      
      resourceLogger.error('Resource request failed', error as Error, {
        packageName,
        operation: 'read-resource'
      });
      
      // For resources, we return the error as content rather than throwing
      return {
        contents: [{
          uri: `spec://${packageName}`,
          text: errorMessage
        }]
      };
    }
  });
}

/**
 * Handle upsert-spec tool requests
 */
export interface UpsertSpecInput {
  pkg: string;
  yaml: string;
}

export async function handleUpsertSpecTool(
  input: UpsertSpecInput,
  config: CatalogConfig = DEFAULT_CONFIG
) {
  const { pkg, yaml } = input;
  
  return await toolLogger.time(`upsert-spec:${pkg}`, async () => {
    try {
      toolLogger.debug('Upsert spec tool called', {
        packageName: pkg,
        operation: 'upsert-spec',
        yamlSize: yaml.length
      });

      const filePath = await writeSpec(pkg, yaml, config);
      
      toolLogger.info('Spec upserted successfully', {
        packageName: pkg,
        operation: 'upsert-spec',
        filePath,
        yamlSize: yaml.length
      });
      
      return {
        content: [{
          type: "text" as const,
          text: `Successfully saved specification for '${pkg}' to: ${filePath}`
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof ValidationError || error instanceof FileSystemError
        ? error.message
        : `Error saving specification: ${error instanceof Error ? error.message : "Unknown error"}`;
      
      toolLogger.error('Spec upsert failed', error as Error, {
        packageName: pkg,
        operation: 'upsert-spec',
        yamlSize: yaml.length
      });
      
      return {
        content: [{
          type: "text" as const,
          text: errorMessage
        }],
        isError: true
      };
    }
  });
}

/**
 * Handle list-specs tool requests
 */
export interface ListSpecsInput {
  filter?: string;
}

export async function handleListSpecsTool(
  input: ListSpecsInput = {},
  config: CatalogConfig = DEFAULT_CONFIG
) {
  const { filter } = input;
  
  return await toolLogger.time(`list-specs${filter ? `:filtered:${filter}` : ''}`, async () => {
    try {
      toolLogger.debug('List specs tool called', {
        filter,
        operation: 'list-specs'
      });

      const specs = await listSpecs(filter, config);
      
      if (specs.length === 0) {
        const message = filter 
          ? `No specifications found matching filter: "${filter}"`
          : "No specifications found in catalog";
        
        toolLogger.info('List specs completed with no results', {
          filter,
          operation: 'list-specs',
          resultCount: 0
        });
        
        return {
          content: [{
            type: "text" as const,
            text: message
          }]
        };
      }
      
      toolLogger.info('List specs completed successfully', {
        filter,
        operation: 'list-specs',
        resultCount: specs.length
      });
      
      const result = `Found ${specs.length} specification(s):\n\n${specs.join("\n")}`;
      return {
        content: [{
          type: "text" as const,
          text: result
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof ValidationError || error instanceof FileSystemError
        ? error.message
        : `Error listing specifications: ${error instanceof Error ? error.message : "Unknown error"}`;
      
      toolLogger.error('List specs failed', error as Error, {
        filter,
        operation: 'list-specs'
      });
      
      return {
        content: [{
          type: "text" as const,
          text: errorMessage
        }],
        isError: true
      };
    }
  });
}

/**
 * Handle catalog-stats tool requests (bonus diagnostic tool)
 */
export async function handleCatalogStatsTool(
  config: CatalogConfig = DEFAULT_CONFIG
) {
  return await toolLogger.time('catalog-stats', async () => {
    try {
      toolLogger.debug('Catalog stats tool called', {
        operation: 'catalog-stats'
      });

      const stats = await getCatalogStats(config);
      
      toolLogger.info('Catalog stats retrieved successfully', {
        operation: 'catalog-stats',
        totalSpecs: stats.totalSpecs,
        catalogPath: stats.catalogPath,
        extensions: Object.keys(stats.specsByExtension)
      });
      
      const result = [
        `Catalog Statistics:`,
        `• Total specifications: ${stats.totalSpecs}`,
        `• Location: ${stats.catalogPath}`,
        `• By extension:`,
        ...Object.entries(stats.specsByExtension).map(([ext, count]) => `  - ${ext}: ${count}`),
        stats.lastUpdated ? `• Last updated: ${stats.lastUpdated.toISOString()}` : ""
      ].filter(Boolean).join("\n");
      
      return {
        content: [{
          type: "text" as const,
          text: result
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof ValidationError || error instanceof FileSystemError
        ? error.message
        : `Error getting catalog statistics: ${error instanceof Error ? error.message : "Unknown error"}`;
      
      toolLogger.error('Catalog stats failed', error as Error, {
        operation: 'catalog-stats'
      });
      
      return {
        content: [{
          type: "text" as const,
          text: errorMessage
        }],
        isError: true
      };
    }
  });
}

/**
 * Self-test function that exercises all handlers
 */
export async function runSelfTest(config: CatalogConfig = DEFAULT_CONFIG): Promise<boolean> {
  const testPkg = "@fluorite-test/self-test";
  const testContent = `id: '${testPkg}'\nname: 'Self Test Package'\ndescription: 'Test package for self-diagnostics'`;
  
  return await diagnosticLogger.time('self-test', async () => {
    try {
      diagnosticLogger.info("Running fluorite-mcp self-test", {
        operation: 'self-test',
        testPackage: testPkg
      });
      
      // Test 1: List specs (should work even if empty)
      diagnosticLogger.debug("Testing list-specs", { operation: 'self-test', step: 1 });
      const listResult = await handleListSpecsTool({}, config);
      if (listResult.isError) {
        throw new Error(`list-specs failed: ${listResult.content[0]?.text}`);
      }
      
      // Test 2: Upsert a test spec
      diagnosticLogger.debug("Testing upsert-spec", { operation: 'self-test', step: 2 });
      const upsertResult = await handleUpsertSpecTool({ pkg: testPkg, yaml: testContent }, config);
      if (upsertResult.isError) {
        throw new Error(`upsert-spec failed: ${upsertResult.content[0]?.text}`);
      }
      
      // Test 3: Read the spec via resource
      diagnosticLogger.debug("Testing spec resource", { operation: 'self-test', step: 3 });
      const resourceResult = await handleSpecResource(testPkg, config);
      if (!resourceResult.contents[0]?.text.includes("Self Test Package")) {
        throw new Error("spec resource failed: content not found");
      }
      
      // Test 4: List specs should now include our test
      diagnosticLogger.debug("Testing list-specs with filter", { operation: 'self-test', step: 4 });
      const listResult2 = await handleListSpecsTool({ filter: "fluorite-test" }, config);
      if (listResult2.isError || !listResult2.content[0]?.text.includes(testPkg)) {
        throw new Error("list-specs with filter failed");
      }
      
      // Test 5: Get catalog stats
      diagnosticLogger.debug("Testing catalog-stats", { operation: 'self-test', step: 5 });
      const statsResult = await handleCatalogStatsTool(config);
      if (statsResult.isError) {
        throw new Error(`catalog-stats failed: ${statsResult.content[0]?.text}`);
      }
      
      // Cleanup: Delete test spec
      try {
        const { deleteSpec } = await import("./catalog.js");
        await deleteSpec(testPkg, config);
        diagnosticLogger.debug("Test cleanup completed", { operation: 'self-test' });
      } catch {
        diagnosticLogger.warn("Test cleanup failed (non-critical)", { operation: 'self-test' });
      }
      
      diagnosticLogger.info("Self-test completed successfully", {
        operation: 'self-test',
        testPackage: testPkg
      });
      return true;
    } catch (error) {
      diagnosticLogger.error("Self-test failed", error as Error, {
        operation: 'self-test',
        testPackage: testPkg
      });
      return false;
    }
  });
}

/**
 * Performance test - check response times
 */
export async function runPerformanceTest(config: CatalogConfig = DEFAULT_CONFIG): Promise<boolean> {
  const testPkg = "@fluorite-perf/performance-test";
  const testContent = "id: '@fluorite-perf/performance-test'\nname: 'Performance Test'";
  const thresholds = {
    listSpecs: 200,    // ms
    upsertSpec: 500,   // ms
    specResource: 100  // ms
  };
  
  return await diagnosticLogger.time('performance-test', async () => {
    try {
      diagnosticLogger.info("Running performance test", {
        operation: 'performance-test',
        testPackage: testPkg,
        thresholds
      });
      
      // Test list-specs response time
      const startList = Date.now();
      await handleListSpecsTool({}, config);
      const listTime = Date.now() - startList;
      performanceMonitor.recordOperation('list-specs', listTime);
      
      if (listTime > thresholds.listSpecs) {
        diagnosticLogger.warn(`list-specs exceeded performance threshold`, {
          operation: 'performance-test',
          actualTime: listTime,
          threshold: thresholds.listSpecs
        });
      }
      
      // Test upsert-spec response time
      const startUpsert = Date.now();
      await handleUpsertSpecTool({ pkg: testPkg, yaml: testContent }, config);
      const upsertTime = Date.now() - startUpsert;
      performanceMonitor.recordOperation('upsert-spec', upsertTime);
      
      if (upsertTime > thresholds.upsertSpec) {
        diagnosticLogger.warn(`upsert-spec exceeded performance threshold`, {
          operation: 'performance-test',
          actualTime: upsertTime,
          threshold: thresholds.upsertSpec
        });
      }
      
      // Test resource read response time
      const startRead = Date.now();
      await handleSpecResource(testPkg, config);
      const readTime = Date.now() - startRead;
      performanceMonitor.recordOperation('spec-resource', readTime);
      
      if (readTime > thresholds.specResource) {
        diagnosticLogger.warn(`spec resource exceeded performance threshold`, {
          operation: 'performance-test',
          actualTime: readTime,
          threshold: thresholds.specResource
        });
      }
      
      // Cleanup
      try {
        const { deleteSpec } = await import("./catalog.js");
        await deleteSpec(testPkg, config);
        diagnosticLogger.debug("Performance test cleanup completed", { operation: 'performance-test' });
      } catch {
        diagnosticLogger.warn("Performance test cleanup failed (non-critical)", { operation: 'performance-test' });
      }
      
      const allWithinLimits = listTime <= thresholds.listSpecs && 
                              upsertTime <= thresholds.upsertSpec && 
                              readTime <= thresholds.specResource;
      
      diagnosticLogger.info("Performance test completed", {
        operation: 'performance-test',
        results: {
          listTime,
          upsertTime,
          readTime,
          allWithinLimits
        },
        thresholds
      });
      
      // Log results only through logger, not console
      
      return allWithinLimits;
    } catch (error) {
      diagnosticLogger.error("Performance test failed", error as Error, {
        operation: 'performance-test',
        testPackage: testPkg
      });
      return false;
    }
  });
}
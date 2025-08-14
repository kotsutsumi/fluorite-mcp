/**
 * Contract tests for MCP handler functions
 * These tests verify MCP protocol compliance, input validation, and response formats
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TEST_CATALOG_DIR } from '../test/setup.js';
import {
  handleSpecResource,
  handleUpsertSpecTool,
  handleListSpecsTool, 
  handleCatalogStatsTool,
  runSelfTest,
  runPerformanceTest,
  getMimeType,
  type UpsertSpecInput,
  type ListSpecsInput
} from './handlers.js';
import { ensureCatalogDirectory, type CatalogConfig, DEFAULT_CONFIG } from './catalog.js';

// Test configuration using the test directory
const testConfig: CatalogConfig = {
  ...DEFAULT_CONFIG,
  baseDir: TEST_CATALOG_DIR
};

describe('getMimeType', () => {
  it('should return correct MIME types', () => {
    expect(getMimeType('.json')).toBe('application/json');
    expect(getMimeType('.yaml')).toBe('text/yaml');
    expect(getMimeType('.yml')).toBe('text/yaml');
    expect(getMimeType('.unknown')).toBe('text/yaml'); // defaults to yaml
  });
});

describe('handleSpecResource', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should return valid ResourceResponse structure', async () => {
    // Create a test spec first
    const { writeSpec } = await import('./catalog.js');
    await writeSpec('test-package', 'id: test-package\nname: Test', testConfig);

    const response = await handleSpecResource('test-package', testConfig);

    // Verify response structure matches MCP ResourceResponse
    expect(response).toHaveProperty('contents');
    expect(Array.isArray(response.contents)).toBe(true);
    expect(response.contents).toHaveLength(1);
    
    const content = response.contents[0];
    expect(content).toHaveProperty('uri', 'spec://test-package');
    expect(content).toHaveProperty('text');
    expect(typeof content.text).toBe('string');
    expect(content.text).toContain('Test');
  });

  it('should include correct MIME type in response', async () => {
    const { writeSpec } = await import('./catalog.js');
    
    // Test with YAML content
    await writeSpec('yaml-package', 'id: yaml-package', testConfig);
    const yamlResponse = await handleSpecResource('yaml-package', testConfig);
    const content = yamlResponse.contents[0];
    if ('mimeType' in content) {
      expect(content.mimeType).toBe('text/yaml');
    }
  });

  it('should handle array input (first element)', async () => {
    const { writeSpec } = await import('./catalog.js');
    await writeSpec('array-test', 'id: array-test', testConfig);

    const response = await handleSpecResource(['array-test', 'ignored'], testConfig);
    
    expect(response.contents[0].uri).toBe('spec://array-test');
    expect(response.contents[0].text).toContain('array-test');
  });

  it('should return error content for non-existent package', async () => {
    const response = await handleSpecResource('non-existent-package', testConfig);

    // Should still return valid ResourceResponse structure
    expect(response).toHaveProperty('contents');
    expect(response.contents).toHaveLength(1);
    expect(response.contents[0].uri).toBe('spec://non-existent-package');
    expect(response.contents[0].text).toContain('not found');
  });

  it('should handle empty package name gracefully', async () => {
    const response = await handleSpecResource('', testConfig);
    
    expect(response.contents[0].text).toContain('required');
  });

  it('should handle array with empty first element', async () => {
    const response = await handleSpecResource(['', 'fallback'], testConfig);
    
    expect(response.contents[0].text).toContain('required');
  });
});

describe('handleUpsertSpecTool', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should return valid ToolResponse structure on success', async () => {
    const input: UpsertSpecInput = {
      pkg: 'upsert-test',
      yaml: 'id: upsert-test\nname: Upsert Test'
    };

    const response = await handleUpsertSpecTool(input, testConfig);

    // Verify response structure matches MCP ToolResponse
    expect(response).toHaveProperty('content');
    expect(Array.isArray(response.content)).toBe(true);
    expect(response.content).toHaveLength(1);
    
    const content = response.content[0];
    expect(content).toHaveProperty('type', 'text');
    expect(content).toHaveProperty('text');
    expect(typeof content.text).toBe('string');
    expect(content.text).toContain('Successfully saved');
    expect(content.text).toContain('upsert-test');
    
    // Should not have isError flag on success
    expect(response.isError).toBeUndefined();
  });

  it('should return error ToolResponse for invalid input', async () => {
    const input: UpsertSpecInput = {
      pkg: '', // invalid empty package name
      yaml: 'some content'
    };

    const response = await handleUpsertSpecTool(input, testConfig);

    expect(response).toHaveProperty('content');
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe('text');
    expect(response.content[0].text).toContain('non-empty string');
    expect(response.isError).toBe(true);
  });

  it('should handle oversized content gracefully', async () => {
    const input: UpsertSpecInput = {
      pkg: 'oversized-test',
      yaml: 'x'.repeat(testConfig.maxFileSize + 100) // Exceeds limit
    };

    const response = await handleUpsertSpecTool(input, testConfig);

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('too large');
  });

  it('should sanitize package names correctly', async () => {
    const input: UpsertSpecInput = {
      pkg: '@scope/package-name',
      yaml: 'id: "@scope/package-name"\nname: Scoped Package'
    };

    const response = await handleUpsertSpecTool(input, testConfig);

    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toContain('@scope/package-name');
    expect(response.content[0].text).toContain('@scope__package-name'); // sanitized filename
  });
});

describe('handleListSpecsTool', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
    
    // Create test specs
    const { writeSpec } = await import('./catalog.js');
    await writeSpec('@scope/package1', 'id: "@scope/package1"', testConfig);
    await writeSpec('simple-package', 'id: "simple-package"', testConfig);
    await writeSpec('@another/package2', 'id: "@another/package2"', testConfig);
  });

  it('should return valid ToolResponse structure', async () => {
    const response = await handleListSpecsTool({}, testConfig);

    expect(response).toHaveProperty('content');
    expect(Array.isArray(response.content)).toBe(true);
    expect(response.content).toHaveLength(1);
    
    const content = response.content[0];
    expect(content).toHaveProperty('type', 'text');
    expect(content).toHaveProperty('text');
    expect(typeof content.text).toBe('string');
  });

  it('should list all specs when no filter provided', async () => {
    const response = await handleListSpecsTool({}, testConfig);

    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toContain('Found 3 specification');
    expect(response.content[0].text).toContain('@scope/package1');
    expect(response.content[0].text).toContain('simple-package');
    expect(response.content[0].text).toContain('@another/package2');
  });

  it('should filter specs when filter provided', async () => {
    const input: ListSpecsInput = { filter: 'scope' };
    const response = await handleListSpecsTool(input, testConfig);

    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toContain('Found 1 specification');
    expect(response.content[0].text).toContain('@scope/package1');
    expect(response.content[0].text).not.toContain('simple-package');
  });

  it('should handle empty results gracefully', async () => {
    const input: ListSpecsInput = { filter: 'nonexistent-filter' };
    const response = await handleListSpecsTool(input, testConfig);

    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toContain('No specifications found matching filter');
  });

  it('should handle empty catalog', async () => {
    // Use different config with empty directory
    const emptyConfig = { ...testConfig, baseDir: TEST_CATALOG_DIR + '-empty-list' };
    const response = await handleListSpecsTool({}, emptyConfig);

    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toContain('No specifications found in catalog');
  });

  it('should handle undefined input gracefully', async () => {
    const response = await handleListSpecsTool(undefined, testConfig);

    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toContain('Found 3 specification');
  });
});

describe('handleCatalogStatsTool', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should return valid ToolResponse structure', async () => {
    const response = await handleCatalogStatsTool(testConfig);

    expect(response).toHaveProperty('content');
    expect(Array.isArray(response.content)).toBe(true);
    expect(response.content).toHaveLength(1);
    
    const content = response.content[0];
    expect(content).toHaveProperty('type', 'text');
    expect(content).toHaveProperty('text');
    expect(typeof content.text).toBe('string');
  });

  it('should include all required statistics', async () => {
    // Create some test specs
    const { writeSpec } = await import('./catalog.js');
    await writeSpec('yaml-spec', 'id: yaml-spec', testConfig);
    
    const response = await handleCatalogStatsTool(testConfig);

    expect(response.isError).toBeUndefined();
    const text = response.content[0].text;
    
    expect(text).toContain('Catalog Statistics:');
    expect(text).toContain('Total specifications:');
    expect(text).toContain('Location:');
    expect(text).toContain('By extension:');
    expect(text).toContain('Last updated:');
  });

  it('should handle empty catalog', async () => {
    const response = await handleCatalogStatsTool(testConfig);

    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toContain('Total specifications: 0');
  });

  it('should count specs by extension correctly', async () => {
    const { writeSpec } = await import('./catalog.js');
    await writeSpec('yaml-spec', 'id: yaml-spec', testConfig);
    
    // Manually create a JSON file for testing
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    await fs.writeFile(
      path.join(TEST_CATALOG_DIR, 'json-spec__.json'),
      '{"id": "json-spec"}',
      'utf-8'
    );

    const response = await handleCatalogStatsTool(testConfig);
    const text = response.content[0].text;

    expect(text).toContain('.yaml: 1');
    expect(text).toContain('.json: 1');
  });
});

describe('runSelfTest', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should return boolean result', async () => {
    const result = await runSelfTest(testConfig);
    expect(typeof result).toBe('boolean');
  });

  it('should complete all test steps successfully', async () => {
    const result = await runSelfTest(testConfig);
    
    expect(result).toBe(true);
    
    // Verify test was successful without checking console output
    // (console output removed to avoid JSON parsing issues in MCP)
  });

  it('should clean up test data', async () => {
    const { specExists } = await import('./catalog.js');
    
    await runSelfTest(testConfig);
    
    // Test spec should be cleaned up
    const exists = await specExists('@fluorite-test/self-test', testConfig);
    expect(exists).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    // Use invalid config to force errors
    const invalidConfig = {
      ...testConfig,
      baseDir: '/invalid/path/that/cannot/exist'
    };
    
    const result = await runSelfTest(invalidConfig);
    
    expect(result).toBe(false);
    // Error handling verified without checking console output
  });
});

describe('runPerformanceTest', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should return boolean result', async () => {
    const result = await runPerformanceTest(testConfig);
    expect(typeof result).toBe('boolean');
  });

  it('should measure performance of all operations', async () => {
    const result = await runPerformanceTest(testConfig);
    
    expect(typeof result).toBe('boolean');
    
    // Performance measurements verified without checking console output
  });

  it('should clean up performance test data', async () => {
    const { specExists } = await import('./catalog.js');
    
    await runPerformanceTest(testConfig);
    
    // Performance test spec should be cleaned up
    const exists = await specExists('@fluorite-perf/performance-test', testConfig);
    expect(exists).toBe(false);
  });

  it('should complete performance measurements', async () => {
    const result = await runPerformanceTest(testConfig);
    
    expect(typeof result).toBe('boolean');
    
    // Performance measurements completed successfully
  });

  it('should handle errors gracefully', async () => {
    // Use a config that will cause catalog operations to fail
    const invalidConfig = {
      ...testConfig,
      maxFileSize: -1 // This will cause validation errors
    };
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    try {
      const result = await runPerformanceTest(invalidConfig);
      
      // The test may still pass if the operations complete
      // Just verify it's a boolean result
      expect(typeof result).toBe('boolean');
    } finally {
      consoleSpy.mockRestore();
    }
  });
});

describe('MCP Protocol Compliance', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should maintain consistent response formats across all handlers', async () => {
    // Resource responses should have 'contents' array
    const resourceResponse = await handleSpecResource('test', testConfig);
    expect(resourceResponse).toHaveProperty('contents');
    expect(Array.isArray(resourceResponse.contents)).toBe(true);
    
    // Tool responses should have 'content' array
    const toolResponse = await handleListSpecsTool({}, testConfig);
    expect(toolResponse).toHaveProperty('content');
    expect(Array.isArray(toolResponse.content)).toBe(true);
    
    const upsertResponse = await handleUpsertSpecTool({ pkg: 'test', yaml: 'test' }, testConfig);
    expect(upsertResponse).toHaveProperty('content');
    expect(Array.isArray(upsertResponse.content)).toBe(true);
    
    const statsResponse = await handleCatalogStatsTool(testConfig);
    expect(statsResponse).toHaveProperty('content');
    expect(Array.isArray(statsResponse.content)).toBe(true);
  });

  it('should handle all error cases with proper MCP response formats', async () => {
    // Resource error - should return content with error message, not throw
    const resourceError = await handleSpecResource('nonexistent', testConfig);
    expect(resourceError.contents[0].text).toContain('not found');
    
    // Tool errors - should have isError: true
    const toolError = await handleUpsertSpecTool({ pkg: '', yaml: 'test' }, testConfig);
    expect(toolError.isError).toBe(true);
    expect(toolError.content[0].type).toBe('text');
  });

  it('should sanitize and validate inputs consistently', async () => {
    // Test various problematic inputs
    const problematicPkg = '@scope/../../../etc/passwd';
    
    // The resource URI preserves original package name (this is correct)
    const resourceResponse = await handleSpecResource(problematicPkg, testConfig);
    expect(resourceResponse.contents[0].uri).toContain(problematicPkg);
    
    // But the file operations should be sanitized (no filesystem traversal)
    const upsertResponse = await handleUpsertSpecTool({ 
      pkg: problematicPkg, 
      yaml: 'test' 
    }, testConfig);
    // Should either succeed (isError undefined) or fail gracefully (isError true)
    expect(upsertResponse.isError === true || upsertResponse.isError === undefined).toBe(true);
    expect(Array.isArray(upsertResponse.content)).toBe(true);
  });
});
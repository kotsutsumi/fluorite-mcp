/**
 * Unit tests for catalog functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TEST_CATALOG_DIR } from '../test/setup.js';
import {
  sanitizePackageName,
  ensureCatalogDirectory,
  readSpec,
  writeSpec,
  listSpecs,
  deleteSpec,
  specExists,
  getCatalogStats,
  type CatalogConfig,
  DEFAULT_CONFIG
} from './catalog.js';
import { ValidationError, FileSystemError } from '../types.js';

// Test configuration using the test directory
const testConfig: CatalogConfig = {
  ...DEFAULT_CONFIG,
  baseDir: TEST_CATALOG_DIR
};

describe('sanitizePackageName', () => {
  it('should sanitize package names correctly', () => {
    expect(sanitizePackageName('@scope/package')).toBe('@scope__package');
    expect(sanitizePackageName('simple-package')).toBe('simple-package');
    expect(sanitizePackageName('@minoru/react-dnd-treeview')).toBe('@minoru__react-dnd-treeview');
    expect(sanitizePackageName('package/with/slashes')).toBe('package__with__slashes');
    expect(sanitizePackageName('package-with-special!@#$%^&*()chars')).toBe('package-with-special_@________chars');
  });

  it('should handle edge cases', () => {
    expect(sanitizePackageName('   spaces   ')).toBe('spaces');
    expect(sanitizePackageName('multiple///slashes')).toBe('multiple__slashes');
  });

  it('should throw ValidationError for invalid inputs', () => {
    expect(() => sanitizePackageName('')).toThrow(ValidationError);
    expect(() => sanitizePackageName('   ')).toThrow(ValidationError);
    expect(() => sanitizePackageName('a'.repeat(300))).toThrow(ValidationError);
  });
});

describe('ensureCatalogDirectory', () => {
  it('should create catalog directory if it does not exist', async () => {
    await ensureCatalogDirectory(testConfig);
    
    // Directory should now exist
    const fs = await import('node:fs/promises');
    await expect(fs.access(TEST_CATALOG_DIR)).resolves.toBeUndefined();
  });

  it('should not fail if directory already exists', async () => {
    await ensureCatalogDirectory(testConfig);
    await ensureCatalogDirectory(testConfig); // Should not throw
  });
});

describe('writeSpec and readSpec', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should write and read a spec correctly', async () => {
    const pkg = '@test/package';
    const content = 'id: "@test/package"\nname: "Test Package"\ndescription: "A test package"';
    
    const filePath = await writeSpec(pkg, content, testConfig);
    expect(filePath).toContain('@test__package.yaml');
    
    const readContent = await readSpec(pkg, testConfig);
    expect(readContent).toBe(content);
  });

  it('should handle different file extensions', async () => {
    const pkg = 'test-pkg';
    const content = '{"id": "test-pkg", "name": "Test"}';
    
    // First write as YAML
    await writeSpec(pkg, content, testConfig);
    
    // Should be readable
    const readContent = await readSpec(pkg, testConfig);
    expect(readContent).toBe(content);
  });

  it('should throw ValidationError for oversized content', async () => {
    const pkg = 'large-package';
    const largeContent = 'x'.repeat(testConfig.maxFileSize + 1);
    
    await expect(writeSpec(pkg, largeContent, testConfig)).rejects.toThrow(ValidationError);
  });

  it('should throw FileSystemError for non-existent specs', async () => {
    await expect(readSpec('non-existent-package', testConfig)).rejects.toThrow(FileSystemError);
  });

  it('should skip empty files and find non-empty ones', async () => {
    const pkg = 'test-with-empty';
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    
    // Create empty .yaml file
    const sanitized = sanitizePackageName(pkg);
    const emptyPath = path.join(TEST_CATALOG_DIR, sanitized + '.yaml');
    await fs.writeFile(emptyPath, '', 'utf-8');
    
    // Create non-empty .yml file  
    const validContent = 'id: test-with-empty\nname: Test';
    const validPath = path.join(TEST_CATALOG_DIR, sanitized + '.yml');
    await fs.writeFile(validPath, validContent, 'utf-8');
    
    // Should read the non-empty file
    const content = await readSpec(pkg, testConfig);
    expect(content).toBe(validContent);
  });
});

describe('listSpecs', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
    
    // Create some test specs
    await writeSpec('@scope/package1', 'id: "@scope/package1"', testConfig);
    await writeSpec('package2', 'id: "package2"', testConfig);
    await writeSpec('@another/package3', 'id: "@another/package3"', testConfig);
  });

  it('should list all specs', async () => {
    const specs = await listSpecs(undefined, testConfig);
    
    expect(specs).toHaveLength(3);
    expect(specs).toContain('@scope/package1');
    expect(specs).toContain('package2');
    expect(specs).toContain('@another/package3');
  });

  it('should filter specs by pattern', async () => {
    const filtered = await listSpecs('scope', testConfig);
    
    expect(filtered).toHaveLength(1);
    expect(filtered).toContain('@scope/package1');
  });

  it('should return empty array for non-matching filter', async () => {
    const filtered = await listSpecs('nonexistent', testConfig);
    
    expect(filtered).toHaveLength(0);
  });

  it('should handle empty catalog', async () => {
    // Use a different test directory
    const emptyConfig = { ...testConfig, baseDir: TEST_CATALOG_DIR + '-empty' };
    
    const specs = await listSpecs(undefined, emptyConfig);
    expect(specs).toHaveLength(0);
  });
});

describe('deleteSpec', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should delete existing spec', async () => {
    const pkg = 'deletable-package';
    await writeSpec(pkg, 'id: deletable-package', testConfig);
    
    expect(await specExists(pkg, testConfig)).toBe(true);
    
    const deleted = await deleteSpec(pkg, testConfig);
    expect(deleted).toBe(true);
    expect(await specExists(pkg, testConfig)).toBe(false);
  });

  it('should return false for non-existent spec', async () => {
    const deleted = await deleteSpec('non-existent', testConfig);
    expect(deleted).toBe(false);
  });
});

describe('specExists', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should return true for existing spec', async () => {
    const pkg = 'existing-package';
    await writeSpec(pkg, 'id: existing-package', testConfig);
    
    expect(await specExists(pkg, testConfig)).toBe(true);
  });

  it('should return false for non-existent spec', async () => {
    expect(await specExists('non-existent', testConfig)).toBe(false);
  });
});

describe('getCatalogStats', () => {
  beforeEach(async () => {
    await ensureCatalogDirectory(testConfig);
  });

  it('should return correct statistics', async () => {
    // Create test specs with different extensions
    await writeSpec('yaml-spec', 'id: yaml-spec', testConfig);
    
    // Create JSON file manually
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    await fs.writeFile(
      path.join(TEST_CATALOG_DIR, 'json-spec__.json'),
      '{"id": "json-spec"}',
      'utf-8'
    );
    
    const stats = await getCatalogStats(testConfig);
    
    expect(stats.totalSpecs).toBe(2);
    expect(stats.specsByExtension['.yaml']).toBe(1);
    expect(stats.specsByExtension['.json']).toBe(1);
    expect(stats.catalogPath).toBe(TEST_CATALOG_DIR);
    expect(stats.lastUpdated).toBeInstanceOf(Date);
  });

  it('should handle empty catalog', async () => {
    const stats = await getCatalogStats(testConfig);
    
    expect(stats.totalSpecs).toBe(0);
    expect(Object.values(stats.specsByExtension).every(count => count === 0)).toBe(true);
  });
});

describe('error handling and edge cases', () => {
  it('should handle concurrent writes safely', async () => {
    await ensureCatalogDirectory(testConfig);
    
    const pkg = 'concurrent-test';
    const promises = Array.from({ length: 5 }, (_, i) =>
      writeSpec(pkg, `content-${i}`, testConfig)
    );
    
    // All writes should succeed
    await expect(Promise.all(promises)).resolves.toBeDefined();
    
    // Final content should be one of the written contents
    const finalContent = await readSpec(pkg, testConfig);
    expect(finalContent).toMatch(/^content-\d$/);
  });

  it('should handle filesystem permission errors gracefully', async () => {
    // This test would need specific setup for permission testing
    // For now, we'll test the error handling path with an invalid directory
    const invalidConfig = {
      ...testConfig,
      baseDir: '/invalid/path/that/cannot/be/created'
    };
    
    await expect(ensureCatalogDirectory(invalidConfig)).rejects.toThrow(FileSystemError);
  });

  it('should validate file size limits', async () => {
    const restrictiveConfig: CatalogConfig = {
      ...testConfig,
      maxFileSize: 10 // Very small limit
    };
    
    await ensureCatalogDirectory(restrictiveConfig);
    
    const pkg = 'oversized-package';
    const oversizedContent = 'x'.repeat(15); // Exceeds 10 byte limit
    
    await expect(writeSpec(pkg, oversizedContent, restrictiveConfig))
      .rejects.toThrow(ValidationError);
  });

  it('should handle filename length limits', () => {
    const longName = 'a'.repeat(300);
    
    expect(() => sanitizePackageName(longName))
      .toThrow(ValidationError);
  });

  it('should handle corrupted or inaccessible files', async () => {
    await ensureCatalogDirectory(testConfig);
    
    // Create a valid spec first
    const pkg = 'test-package';
    const filePath = await writeSpec(pkg, 'valid content', testConfig);
    
    // Now make the file inaccessible by changing its permissions
    const fs = await import('node:fs/promises');
    
    try {
      await fs.chmod(filePath, 0o000); // Remove all permissions
      
      // Reading should now fail with FileSystemError
      await expect(readSpec(pkg, testConfig)).rejects.toThrow(FileSystemError);
    } finally {
      // Restore permissions for cleanup
      try {
        await fs.chmod(filePath, 0o644);
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});
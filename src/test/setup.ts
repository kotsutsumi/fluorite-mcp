/**
 * Vitest test setup and global configuration
 */

import { beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Test catalog directory
export const TEST_CATALOG_DIR = path.resolve('src/test-catalog');

// Clean up test catalog before and after each test
beforeEach(async () => {
  await cleanupTestCatalog();
});

afterEach(async () => {
  await cleanupTestCatalog();
});

async function cleanupTestCatalog() {
  try {
    await fs.rm(TEST_CATALOG_DIR, { recursive: true, force: true });
  } catch (error) {
    // Ignore if directory doesn't exist
  }
}
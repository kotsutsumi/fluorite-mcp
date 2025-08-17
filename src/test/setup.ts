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

// Further constrain discovery and auto-spike resource usage during tests
if (!process.env.FLUORITE_SPIKE_METADATA_MULTIPLIER) {
  process.env.FLUORITE_SPIKE_METADATA_MULTIPLIER = '1';
}
if (!process.env.FLUORITE_AUTO_SPIKE_BATCH) {
  process.env.FLUORITE_AUTO_SPIKE_BATCH = '25';
}
if (!process.env.FLUORITE_AUTO_SPIKE_TOP) {
  process.env.FLUORITE_AUTO_SPIKE_TOP = '3';
}

// Constrain spike listing during tests to reduce memory usage
if (!process.env.FLUORITE_SPIKE_LIST_LIMIT) {
  process.env.FLUORITE_SPIKE_LIST_LIMIT = '80';
}

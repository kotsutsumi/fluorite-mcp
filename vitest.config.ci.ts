import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000, // Increase timeout for CI
    hookTimeout: 30000,
    setupFiles: ['./src/test/setup.ts'],
    // Skip coverage in CI to save memory
    include: ['src/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'docs/',
      // Temporarily exclude memory-intensive tests in CI
      'src/test/static-analysis.test.ts'
    ],
    reporter: ['verbose'],
    // Use single thread to minimize memory usage
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        maxForks: 1,
        isolate: true,
        // Run garbage collection between tests
        execArgv: ['--expose-gc']
      }
    },
    // Memory optimization settings
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    maxConcurrency: 1,
    fileParallelism: false,
    // Fail fast on first test failure
    bail: 1,
    // Disable watch mode
    watch: false,
    // Run tests sequentially
    sequence: {
      shuffle: false,
      concurrent: false
    }
  }
});
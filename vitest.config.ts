import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'docs/',
        '*.config.*',
        'src/test/',
        'src/**/*.test.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/', 'docs/'],
    // E2E tests need more time for process spawning
    reporter: ['default'],
    pool: 'forks', // Use forks for better process isolation
    poolOptions: {
      forks: {
        singleFork: true // Run tests sequentially for E2E stability
      }
    }
  }
});
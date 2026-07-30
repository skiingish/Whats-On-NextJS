import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/.next/**', '.claude/**'],
    // Intercepts Supabase in-process for every test file. Pure-logic tests are
    // unaffected (they make no requests); the data-layer tests depend on it.
    setupFiles: ['./tests/msw/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});

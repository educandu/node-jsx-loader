import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    loader: 'jsx',
    include: ['src/**/*.js'],
    exclude: []
  },
  test: {
    include: ['src/**/*.spec.js'],
    exclude: [],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: ['src/test-files/**']
    }
  }
});

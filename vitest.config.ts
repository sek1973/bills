import angular from '@analogjs/vite-plugin-angular';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [angular({ tsconfig: './tsconfig.vitest.json' })],
  resolve: {
    alias: {
      'projects/model/src/public-api': path.resolve(__dirname, 'projects/model/src/public-api.ts'),
      'projects/store/src/public-api': path.resolve(__dirname, 'projects/store/src/public-api.ts'),
      'projects/tools/src/public-api': path.resolve(__dirname, 'projects/tools/src/public-api.ts'),
      'projects/views/src/public-api': path.resolve(__dirname, 'projects/views/src/public-api.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setup-vitest.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    include: [
      'projects/bills-main-app/src/**/*.spec.ts',
      'projects/bills-testing-app/src/**/*.spec.ts',
      'projects/model/src/**/*.spec.ts',
      'projects/store/src/**/*.spec.ts',
      'projects/tools/src/**/*.spec.ts',
      'projects/views/src/**/*.spec.ts',
    ],
  },
});

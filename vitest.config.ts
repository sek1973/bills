import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({ tsconfig: './tsconfig.vitest.json' })],
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

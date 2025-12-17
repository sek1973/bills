import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    include: [
      'projects/bills-main-app/src/**/*.spec.ts',
      'projects/bills-testing-app/src/**/*.spec.ts',
      'projects/model/src/**/*.spec.ts',
      'projects/my-schematics/src/**/*.spec.ts',
      'projects/store/src/**/*.spec.ts',
      'projects/tools/src/**/*.spec.ts',
      'projects/views/src/**/*.spec.ts',
    ],
  },
});

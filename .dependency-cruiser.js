/** @type {import('dependency-cruiser').IConfiguration} */
// eslint-disable-next-line no-undef
module.exports = {
  forbidden: [
    // ── Circular dependencies ────────────────────────────────────────────────
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies make code hard to reason about and can cause runtime issues.',
      from: {},
      to: { circular: true },
    },

    // ── Layer boundary enforcement ───────────────────────────────────────────
    // model is the base layer — it must not depend on anything above it
    {
      name: 'model-layer-integrity',
      severity: 'error',
      comment: '@bills/model must not import from store, tools, or views.',
      from: { path: '^projects/model/' },
      to: { path: '^projects/(store|tools|views)/' },
    },

    // tools may only depend on model
    {
      name: 'tools-layer-integrity',
      severity: 'error',
      comment: '@bills/tools must not import from store or views.',
      from: { path: '^projects/tools/' },
      to: { path: '^projects/(store|views)/' },
    },

    // store may depend on model and tools, but not views
    {
      name: 'store-layer-integrity',
      severity: 'error',
      comment: '@bills/store must not import from views.',
      from: { path: '^projects/store/' },
      to: { path: '^projects/views/' },
    },

    // apps must not import from each other
    {
      name: 'app-isolation',
      severity: 'error',
      comment: 'Application projects must not depend on each other.',
      from: { path: '^projects/bills-main-app/' },
      to: { path: '^projects/bills-testing-app/' },
    },
    {
      name: 'app-isolation-reverse',
      severity: 'error',
      comment: 'Application projects must not depend on each other.',
      from: { path: '^projects/bills-testing-app/' },
      to: { path: '^projects/bills-main-app/' },
    },

    // ── Orphans ──────────────────────────────────────────────────────────────
    {
      name: 'no-orphans',
      severity: 'ignore', // error, warn, info, ignore
      comment: 'Files that are not imported anywhere are likely dead code.',
      from: {
        orphan: true,
        pathNot: [
          '\\.spec\\.ts$',
          '(^|/)index\\.ts$',
          'public-api\\.ts$',
          'main\\.ts$',
          'polyfills\\.ts$',
          'styles\\.scss$',
        ],
      },
      to: {},
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};

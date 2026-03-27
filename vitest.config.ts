import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'apps/api/src/**/*.test.ts',
      'packages/*/src/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'apps/api/src/auth.ts',
        'apps/api/src/ratelimit.ts',
        'apps/api/src/schemas.ts',
        'apps/api/src/billing_webhook.ts',
        'apps/api/src/routes/flows.ts',
        'apps/api/src/routes/runs.ts',
        'apps/api/src/routes/resources.ts',
        'apps/api/src/routes/analytics.ts',
        'apps/api/src/security/pii-redaction.ts',
        'apps/api/src/security/encryption.ts',
        'apps/api/src/security/encryption-keys.ts',
        'packages/runner/src/subtitle.ts',
        'packages/runner/src/locator.ts',
      ],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80,
      },
    },
  },
});

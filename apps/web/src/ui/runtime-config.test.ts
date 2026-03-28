import { describe, it, expect } from 'vitest';
import { getWebRuntimeConfig } from './runtime-config';

function makeEnv(overrides: Partial<ImportMetaEnv> & { DEV?: boolean; PROD?: boolean } = {}) {
  return {
    VITE_API_URL: overrides.VITE_API_URL,
    VITE_CLERK_PUBLISHABLE_KEY: overrides.VITE_CLERK_PUBLISHABLE_KEY,
    DEV: overrides.DEV ?? false,
    PROD: overrides.PROD ?? false,
  } as ImportMetaEnv;
}

describe('getWebRuntimeConfig', () => {
  it('allows local development fallback when Clerk is missing in dev', () => {
    const config = getWebRuntimeConfig(makeEnv({ DEV: true, PROD: false }));

    expect(config.allowDevelopmentFallback).toBe(true);
    expect(config.protectedAppReady).toBe(true);
  });

  it('fails protected routes in production when Clerk is missing', () => {
    const config = getWebRuntimeConfig(
      makeEnv({
        PROD: true,
        VITE_API_URL: 'https://api.example.com',
      })
    );

    expect(config.authReady).toBe(false);
    expect(config.protectedAppReady).toBe(false);
    expect(config.issues.some((issue) => issue.code === 'clerk_publishable_key_missing')).toBe(
      true
    );
  });

  it('fails protected routes in production when Clerk uses a test key', () => {
    const config = getWebRuntimeConfig(
      makeEnv({
        PROD: true,
        VITE_API_URL: 'https://api.example.com',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_example',
      })
    );

    expect(config.authReady).toBe(false);
    expect(config.protectedAppReady).toBe(false);
    expect(config.issues.some((issue) => issue.code === 'clerk_publishable_key_invalid')).toBe(
      true
    );
  });

  it('fails production when API URL is missing or non-https', () => {
    const config = getWebRuntimeConfig(
      makeEnv({
        PROD: true,
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_live_example',
      })
    );

    expect(config.apiReady).toBe(false);
    expect(config.protectedAppReady).toBe(false);
    expect(config.issues.some((issue) => issue.code === 'api_url_missing')).toBe(true);
  });

  it('accepts fully configured production builds', () => {
    const config = getWebRuntimeConfig(
      makeEnv({
        PROD: true,
        VITE_API_URL: 'https://api.example.com',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_live_example',
      })
    );

    expect(config.apiReady).toBe(true);
    expect(config.authReady).toBe(true);
    expect(config.protectedAppReady).toBe(true);
    expect(config.issues).toHaveLength(0);
  });
});

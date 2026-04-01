import { describe, expect, it } from 'vitest';
import { getAuthConfig } from './auth-config';

const baseEnv = {
  AUTH_SECRET: 'test-secret',
  PUBLIC_BASE_URL: 'https://flow.coderail.dev',
  ADDITIONAL_PUBLIC_ORIGINS: 'https://coderail-flow.pages.dev',
} as any;

describe('getAuthConfig', () => {
  it('allows redirecting back to the configured frontend origin', async () => {
    const config = getAuthConfig(baseEnv);
    const redirect = await config.callbacks?.redirect?.({
      url: 'https://flow.coderail.dev/app',
      baseUrl: 'https://api.coderail.dev',
    });

    expect(redirect).toBe('https://flow.coderail.dev/app');
  });

  it('falls back to the public app origin for untrusted callback URLs', async () => {
    const config = getAuthConfig(baseEnv);
    const redirect = await config.callbacks?.redirect?.({
      url: 'https://evil.example.com/phish',
      baseUrl: 'https://api.coderail.dev',
    });

    expect(redirect).toBe('https://flow.coderail.dev');
  });
});

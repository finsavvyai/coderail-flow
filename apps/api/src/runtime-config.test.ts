import { describe, expect, it } from 'vitest';
import { resolveCorsOrigin } from './runtime-config.js';

describe('resolveCorsOrigin', () => {
  it('reflects the caller origin during local development', () => {
    expect(
      resolveCorsOrigin('http://localhost:5173', {
        APP_ENV: 'development',
        PUBLIC_BASE_URL: 'http://localhost:8787',
      })
    ).toBe('http://localhost:5173');
  });

  it('falls back to wildcard when no origin is provided outside locked-down envs', () => {
    expect(
      resolveCorsOrigin(undefined, {
        APP_ENV: 'test',
        PUBLIC_BASE_URL: 'http://localhost:8787',
      })
    ).toBe('*');
  });

  it('locks staging to the configured public origin', () => {
    expect(
      resolveCorsOrigin('https://evil.example.com', {
        APP_ENV: 'staging',
        PUBLIC_BASE_URL: 'https://staging.coderail-flow.example.com/app',
      })
    ).toBe('https://staging.coderail-flow.example.com');
  });

  it('allows the configured origin in production-like envs', () => {
    expect(
      resolveCorsOrigin('https://coderail-flow.example.com', {
        APP_ENV: 'production',
        PUBLIC_BASE_URL: 'https://coderail-flow.example.com/dashboard',
      })
    ).toBe('https://coderail-flow.example.com');
  });
});

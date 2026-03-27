import { describe, it, expect } from 'vitest';
import { encryptJsonAtRest, decryptJsonAtRest } from './encryption.js';
import type { Env } from '../env.js';

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    DB: {} as any,
    ARTIFACTS: {} as any,
    BROWSER: {} as any,
    APP_ENV: 'test',
    PUBLIC_BASE_URL: 'http://localhost',
    INTEGRATION_ENCRYPTION_KEY: 'test-secret-key-for-unit-tests-32b',
    INTEGRATION_ENCRYPTION_KEY_ID: 'key-1',
    ...overrides,
  } as Env;
}

describe('encryptJsonAtRest + decryptJsonAtRest round-trip', () => {
  it('encrypts and decrypts simple object', async () => {
    const env = makeEnv();
    const payload = { foo: 'bar', num: 42, flag: true };
    const serialized = await encryptJsonAtRest(payload, env);
    expect(typeof serialized).toBe('string');

    const parsed = JSON.parse(serialized);
    expect(parsed.mode).toBe('aes-gcm');
    expect(parsed.iv).toBeTruthy();
    expect(parsed.ciphertext).toBeTruthy();

    const decrypted = await decryptJsonAtRest(serialized, env);
    expect(decrypted).toEqual(payload);
  });

  it('encrypts nested objects correctly', async () => {
    const env = makeEnv();
    const payload = { user: { email: 'a@b.com', roles: ['admin'] }, meta: { count: 7 } };
    const serialized = await encryptJsonAtRest(payload, env);
    const decrypted = await decryptJsonAtRest(serialized, env);
    expect(decrypted).toEqual(payload);
  });

  it('produces different ciphertexts for same plaintext (random IV)', async () => {
    const env = makeEnv();
    const payload = { data: 'same' };
    const a = await encryptJsonAtRest(payload, env);
    const b = await encryptJsonAtRest(payload, env);
    expect(a).not.toBe(b);
  });

  it('stores plain mode when no encryption key configured', async () => {
    const env = makeEnv({ INTEGRATION_ENCRYPTION_KEY: undefined, AUTH_ENCRYPTION_KEY: undefined });
    const payload = { secret: 'value' };
    const serialized = await encryptJsonAtRest(payload, env);
    const parsed = JSON.parse(serialized);
    expect(parsed.mode).toBe('plain');
    const decrypted = await decryptJsonAtRest(serialized, env);
    expect(decrypted).toEqual(payload);
  });

  it('decrypts plain mode without a key configured', async () => {
    const plainSerialized = JSON.stringify({ mode: 'plain', payload: { x: 1 } });
    const env = makeEnv({ INTEGRATION_ENCRYPTION_KEY: undefined });
    const decrypted = await decryptJsonAtRest(plainSerialized, env);
    expect(decrypted).toEqual({ x: 1 });
  });

  it('returns empty object for empty string input', async () => {
    const env = makeEnv();
    const decrypted = await decryptJsonAtRest('', env);
    expect(decrypted).toEqual({});
  });

  it('returns empty object for invalid JSON input', async () => {
    const env = makeEnv();
    const decrypted = await decryptJsonAtRest('not-valid-json{{{', env);
    expect(decrypted).toEqual({});
  });

  it('decrypts using fallback key when active key changes', async () => {
    const originalEnv = makeEnv({
      INTEGRATION_ENCRYPTION_KEY: 'original-secret-key-32bytes-paddd',
      INTEGRATION_ENCRYPTION_KEY_ID: 'old-key',
    });
    const payload = { data: 'important' };
    const serialized = await encryptJsonAtRest(payload, originalEnv);

    const newEnv = makeEnv({
      INTEGRATION_ENCRYPTION_KEY: 'new-secret-key-32bytes-xxxxxxxxxxx',
      INTEGRATION_ENCRYPTION_KEY_ID: 'new-key',
      INTEGRATION_ENCRYPTION_FALLBACK_KEYS: 'old-key:original-secret-key-32bytes-paddd',
    });
    const decrypted = await decryptJsonAtRest(serialized, newEnv);
    expect(decrypted).toEqual(payload);
  });

  it('throws when no key can decrypt', async () => {
    const env = makeEnv({ INTEGRATION_ENCRYPTION_KEY: 'key-a-32bytes-xxxxxxxxxxxxxxxxxxxxxxxx' });
    const payload = { secret: 'data' };
    const serialized = await encryptJsonAtRest(payload, env);

    const wrongEnv = makeEnv({ INTEGRATION_ENCRYPTION_KEY: 'wrong-key-32bytes-yyyyyyyyyyyyyy' });
    await expect(decryptJsonAtRest(serialized, wrongEnv)).rejects.toThrow(/Unable to decrypt/);
  });
});

import type { Env } from './env';

export type AuthProfilePayload = {
  cookies: any[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
};

export type AuthProfileStorageMode = 'encrypted_payload' | 'legacy';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest('SHA-256', textEncoder.encode(secret));
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptAuthProfilePayload(
  payload: AuthProfilePayload,
  env: Env
): Promise<string> {
  const secret = env.AUTH_ENCRYPTION_KEY;
  const plaintext = textEncoder.encode(JSON.stringify(payload));

  if (!secret) {
    return JSON.stringify({ mode: 'plain', payload: JSON.parse(textDecoder.decode(plaintext)) });
  }

  const key = await deriveAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  return JSON.stringify({
    mode: 'aes-gcm',
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted)),
  });
}

export async function decryptAuthProfilePayload(
  serialized: string,
  env: Env
): Promise<AuthProfilePayload> {
  const parsed = JSON.parse(serialized || '{}');

  if (parsed.mode === 'plain') {
    return {
      cookies: parsed.payload?.cookies ?? [],
      localStorage: parsed.payload?.localStorage ?? {},
      sessionStorage: parsed.payload?.sessionStorage ?? {},
    };
  }

  if (parsed.mode === 'aes-gcm') {
    const secret = env.AUTH_ENCRYPTION_KEY;
    if (!secret) {
      throw new Error('AUTH_ENCRYPTION_KEY is required to decrypt auth profiles');
    }

    const key = await deriveAesKey(secret);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(fromBase64(parsed.iv)) },
      key,
      toArrayBuffer(fromBase64(parsed.ciphertext))
    );

    const payload = JSON.parse(textDecoder.decode(new Uint8Array(decrypted)));
    return {
      cookies: payload.cookies ?? [],
      localStorage: payload.localStorage ?? {},
      sessionStorage: payload.sessionStorage ?? {},
    };
  }

  return {
    cookies: parsed.cookies ?? [],
    localStorage: parsed.localStorage ?? {},
    sessionStorage: parsed.sessionStorage ?? {},
  };
}

function parseJsonSafely<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function readAuthProfilePayloadFromRow(
  row: any,
  env: Env
): Promise<AuthProfilePayload> {
  if (row?.encrypted_payload) {
    return decryptAuthProfilePayload(row.encrypted_payload, env);
  }

  const parsedCookies = parseJsonSafely<any>(row?.cookies, []);
  if (
    parsedCookies &&
    typeof parsedCookies === 'object' &&
    !Array.isArray(parsedCookies) &&
    parsedCookies.mode
  ) {
    return decryptAuthProfilePayload(JSON.stringify(parsedCookies), env);
  }

  return {
    cookies: Array.isArray(parsedCookies) ? parsedCookies : [],
    localStorage: parseJsonSafely<Record<string, string>>(row?.local_storage, {}),
    sessionStorage: parseJsonSafely<Record<string, string>>(row?.session_storage, {}),
  };
}

export async function toAuthProfileStorage(
  payload: AuthProfilePayload,
  env: Env,
  mode: AuthProfileStorageMode
): Promise<{
  encrypted_payload?: string;
  cookies?: string;
  local_storage?: string;
  session_storage?: string;
}> {
  if (mode === 'encrypted_payload') {
    return { encrypted_payload: await encryptAuthProfilePayload(payload, env) };
  }

  return {
    cookies: await encryptAuthProfilePayload(payload, env),
    local_storage: JSON.stringify({}),
    session_storage: JSON.stringify({}),
  };
}

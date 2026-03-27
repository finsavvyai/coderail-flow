import type { Env } from '../env';

export type KeyCandidate = {
  id: string;
  secret: string;
};

type KmsKeyResponse = {
  id?: string;
  keyId?: string;
  secret?: string;
  key?: string;
};

export type EncryptedEnvelope = {
  mode: 'aes-gcm';
  keyId: string;
  iv: string;
  ciphertext: string;
};

export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function parseFallbackKeyRing(raw: string | undefined): KeyCandidate[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry, index) => {
      const [idMaybe, ...secretParts] = entry.split(':');
      if (secretParts.length === 0) {
        return { id: `fallback-${index + 1}`, secret: idMaybe };
      }
      return { id: idMaybe || `fallback-${index + 1}`, secret: secretParts.join(':') };
    })
    .filter((entry) => Boolean(entry.secret));
}

function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function fetchKmsKeyCandidate(env: Env, keyName: string): Promise<KeyCandidate | null> {
  if (!env.CLOUDFLARE_KMS) return null;

  const response = await env.CLOUDFLARE_KMS.fetch(
    `http://kms/keys/${encodeURIComponent(keyName)}`,
    {
      headers: env.CLOUDFLARE_KMS_AUTH_TOKEN
        ? {
            Authorization: `Bearer ${env.CLOUDFLARE_KMS_AUTH_TOKEN}`,
          }
        : undefined,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Cloudflare KMS key fetch failed for '${keyName}' with status ${response.status}`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = (await response.json()) as KmsKeyResponse;
    const secret = body.secret || body.key;
    if (!secret) {
      throw new Error(`Cloudflare KMS key response for '${keyName}' did not include a usable key`);
    }
    return {
      id: body.id || body.keyId || keyName,
      secret,
    };
  }

  const secret = (await response.text()).trim();
  if (!secret) {
    throw new Error(`Cloudflare KMS key response for '${keyName}' was empty`);
  }
  return {
    id: keyName,
    secret,
  };
}

export async function getIntegrationKeyRing(
  env: Env
): Promise<{ active: KeyCandidate | null; candidates: KeyCandidate[] }> {
  const kmsPrimaryKeyName = env.INTEGRATION_ENCRYPTION_KMS_KEY_NAME;
  const kmsFallbackKeyNames = parseList(env.INTEGRATION_ENCRYPTION_KMS_FALLBACK_KEY_NAMES);

  const kmsCandidates: KeyCandidate[] = [];
  if (kmsPrimaryKeyName) {
    const primaryCandidate = await fetchKmsKeyCandidate(env, kmsPrimaryKeyName);
    if (primaryCandidate) kmsCandidates.push(primaryCandidate);
  }
  for (const fallbackKeyName of kmsFallbackKeyNames) {
    const fallbackCandidate = await fetchKmsKeyCandidate(env, fallbackKeyName);
    if (fallbackCandidate) kmsCandidates.push(fallbackCandidate);
  }

  const activeSecret = env.INTEGRATION_ENCRYPTION_KEY || env.AUTH_ENCRYPTION_KEY;
  const envActive = activeSecret
    ? {
        id: env.INTEGRATION_ENCRYPTION_KEY_ID || 'default',
        secret: activeSecret,
      }
    : null;

  const fallback = parseFallbackKeyRing(env.INTEGRATION_ENCRYPTION_FALLBACK_KEYS);
  const active = kmsCandidates[0] || envActive;

  const candidates = [...kmsCandidates, ...(envActive ? [envActive] : []), ...fallback].filter(
    (candidate, index, list) =>
      list.findIndex((c) => c.id === candidate.id && c.secret === candidate.secret) === index
  );

  return { active, candidates };
}

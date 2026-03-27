import type { Env } from '../env';
import {
  type KeyCandidate,
  type EncryptedEnvelope,
  encoder,
  decoder,
  toBase64,
  fromBase64,
  toArrayBuffer,
  deriveAesKey,
  getIntegrationKeyRing,
} from './encryption-keys';

export async function encryptJsonAtRest(payload: Record<string, any>, env: Env): Promise<string> {
  const keyRing = await getIntegrationKeyRing(env);
  if (!keyRing.active) {
    return JSON.stringify({ mode: 'plain', payload });
  }

  const key = await deriveAesKey(keyRing.active.secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(payload))
  );

  const envelope: EncryptedEnvelope = {
    mode: 'aes-gcm',
    keyId: keyRing.active.id,
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted)),
  };
  return JSON.stringify(envelope);
}

async function decryptWithCandidate(
  envelope: EncryptedEnvelope,
  candidate: KeyCandidate
): Promise<Record<string, any>> {
  const key = await deriveAesKey(candidate.secret);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(fromBase64(envelope.iv)) },
    key,
    toArrayBuffer(fromBase64(envelope.ciphertext))
  );
  return JSON.parse(decoder.decode(new Uint8Array(plaintext)));
}

export async function decryptJsonAtRest(
  serialized: string,
  env: Env
): Promise<Record<string, any>> {
  if (!serialized) return {};

  let parsed: any;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return {};
  }

  if (parsed?.mode === 'plain') {
    return (parsed.payload || {}) as Record<string, any>;
  }

  if (parsed?.mode === 'aes-gcm') {
    const envelope = parsed as EncryptedEnvelope;
    const keyRing = await getIntegrationKeyRing(env);

    const preferred = keyRing.candidates.find((candidate) => candidate.id === envelope.keyId);
    const attempts = preferred
      ? [preferred, ...keyRing.candidates.filter((candidate) => candidate !== preferred)]
      : keyRing.candidates;

    for (const candidate of attempts) {
      try {
        return await decryptWithCandidate(envelope, candidate);
      } catch {
        // try next candidate
      }
    }
    throw new Error('Unable to decrypt encrypted config: no valid key candidate');
  }

  return (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, any>;
}

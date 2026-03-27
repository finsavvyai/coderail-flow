// Cookie Encryption Utility for Auth Profiles
// Uses AES-256-GCM for secure cookie storage

import { crypto } from 'crypto';

const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
}

/** Derive encryption key from org ID and master secret using PBKDF2 */
export async function deriveKey(
  orgId: string,
  masterSecret: string,
  salt: Buffer
): Promise<Buffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`${orgId}:${masterSecret}`),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  const exported = await crypto.subtle.exportKey('raw', key);
  return Buffer.from(exported);
}

/** Encrypt cookie data using AES-256-GCM */
export async function encryptCookies(
  cookies: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>,
  orgId: string,
  masterSecret: string
): Promise<EncryptedData> {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = await deriveKey(orgId, masterSecret, salt);

  const plaintext = JSON.stringify(cookies);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/** Decrypt cookie data using AES-256-GCM */
export async function decryptCookies(
  encrypted: EncryptedData,
  orgId: string,
  masterSecret: string
): Promise<
  Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>
> {
  const salt = Buffer.from(encrypted.salt, 'hex');
  const key = await deriveKey(orgId, masterSecret, salt);
  const iv = Buffer.from(encrypted.iv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  const tag = Buffer.from(encrypted.tag, 'hex');
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');
  return JSON.parse(plaintext);
}

// Re-export utility functions for backwards compatibility
export {
  validateCookieFormat,
  areCookiesExpired,
  getCookiesExpiry,
  maskCookieValue,
  formatCookiesForDisplay,
} from './cookie-encryption-utils';

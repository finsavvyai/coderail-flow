export interface ApiTokenClaims {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
  nbf?: number;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export async function encodeApiToken(
  userId: string,
  email: string | null | undefined,
  secret: string
): Promise<string> {
  const header = base64urlEncodeJson({ alg: 'HS256', typ: 'JWT' });
  const payload = base64urlEncodeJson({
    sub: userId,
    email: email ?? undefined,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const data = `${header}.${payload}`;
  const signature = await sign(data, secret);
  return `${data}.${base64urlEncodeBytes(signature)}`;
}

export async function verifyApiToken(token: string, secret: string): Promise<ApiTokenClaims> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseJson<ApiTokenHeader>(encodedHeader, 'Invalid JWT header');
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Unsupported JWT algorithm');
  }

  const signature = base64urlDecodeBytes(encodedSignature);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const valid = await verify(signingInput, signature, secret);
  if (!valid) {
    throw new Error('Invalid JWT signature');
  }

  const payload = parseJson<ApiTokenClaims>(encodedPayload, 'Invalid JWT payload');
  if (typeof payload.sub !== 'string' || payload.sub.trim().length === 0) {
    throw new Error('Token subject is missing');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }
  if (payload.nbf && payload.nbf > now + 60) {
    throw new Error('Token not yet valid');
  }

  return payload;
}

interface ApiTokenHeader {
  alg: string;
  typ: string;
}

async function sign(input: string, secret: string): Promise<Uint8Array> {
  const key = await importSigningKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(input));
  return new Uint8Array(signature);
}

async function verify(input: string, signature: Uint8Array, secret: string): Promise<boolean> {
  const key = await importSigningKey(secret, ['verify']);
  return crypto.subtle.verify('HMAC', key, signature as BufferSource, textEncoder.encode(input));
}

async function importSigningKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages
  );
}

function base64urlEncodeJson(value: unknown): string {
  return base64urlEncodeBytes(textEncoder.encode(JSON.stringify(value)));
}

function base64urlEncodeBytes(input: Uint8Array): string {
  let binary = '';
  for (const byte of input) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecodeBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function parseJson<T>(value: string, message: string): T {
  try {
    return JSON.parse(textDecoder.decode(base64urlDecodeBytes(value))) as T;
  } catch {
    throw new Error(message);
  }
}

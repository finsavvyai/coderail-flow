import { MiddlewareHandler } from 'hono';
import type { Env } from './env';
import { isProductionLikeEnv } from './runtime-config';

type AuthVariables = { userId: string; userEmail?: string };

// JWKS cache (in-memory, per isolate)
let jwksCache: { keys: JsonWebKey[]; fetchedAt: number } | null = null;
const JWKS_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch Clerk JWKS and cache in memory
 */
async function getJwks(issuer: string): Promise<JsonWebKey[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys;
  }

  const url = `${issuer}/.well-known/jwks.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch JWKS from ${url}: ${res.status}`);
  const data = await res.json<{ keys: JsonWebKey[] }>();

  jwksCache = { keys: data.keys, fetchedAt: Date.now() };
  return data.keys;
}

/**
 * Import a JWK as a CryptoKey for RS256 verification
 */
async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

/**
 * Decode a JWT without verification (to read header/payload)
 */
function decodeJwt(token: string): {
  header: any;
  payload: any;
  signatureBytes: Uint8Array;
  signedPart: string;
} {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

  // Decode signature
  const sigB64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
  const sigBinary = atob(sigB64);
  const signatureBytes = new Uint8Array(sigBinary.length);
  for (let i = 0; i < sigBinary.length; i++) signatureBytes[i] = sigBinary.charCodeAt(i);

  return { header, payload, signatureBytes, signedPart: `${parts[0]}.${parts[1]}` };
}

/**
 * Verify a Clerk JWT token
 */
async function verifyToken(
  token: string,
  issuer: string
): Promise<{ sub: string; email?: string }> {
  const { header, payload, signatureBytes, signedPart } = decodeJwt(token);

  // Find matching key
  const keys = await getJwks(issuer);
  const jwk = keys.find((k) => (k as any).kid === header.kid);
  if (!jwk) throw new Error('No matching key found in JWKS');

  // Verify signature
  const key = await importKey(jwk);
  const encoder = new TextEncoder();
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signatureBytes as unknown as ArrayBuffer,
    encoder.encode(signedPart)
  );
  if (!valid) throw new Error('Invalid JWT signature');

  // Check claims
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error('Token expired');
  if (payload.nbf && payload.nbf > now + 60) throw new Error('Token not yet valid');
  if (payload.iss && payload.iss !== issuer) throw new Error('Issuer mismatch');

  return { sub: payload.sub, email: payload.email };
}

/**
 * Hono middleware: require a valid Clerk JWT.
 * Sets `userId` on context variables.
 * Skips auth if CLERK_ISSUER is not configured (dev mode).
 */
export function requireAuth(): MiddlewareHandler<{ Bindings: Env; Variables: AuthVariables }> {
  return async (c, next) => {
    const env = c.env;

    // Skip auth only in local/test environments where Clerk is intentionally omitted.
    if (!env.CLERK_ISSUER) {
      if (isProductionLikeEnv(env.APP_ENV)) {
        return c.json(
          {
            error: 'service_unavailable',
            message: 'Authentication is not configured for this environment.',
          },
          503
        );
      }

      c.set('userId', 'dev-user');
      return next();
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        { error: 'unauthorized', message: 'Missing or invalid Authorization header' },
        401
      );
    }

    const token = authHeader.slice(7);

    try {
      const claims = await verifyToken(token, env.CLERK_ISSUER);
      c.set('userId', claims.sub);
      if (claims.email) c.set('userEmail', claims.email);
    } catch (err: any) {
      return c.json({ error: 'unauthorized', message: err.message }, 401);
    }

    return next();
  };
}

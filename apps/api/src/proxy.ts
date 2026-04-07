/**
 * Full reverse proxy for Flow Recorder.
 *
 * URL scheme:  /proxy/<base64(origin)>/path?query
 *
 * Example:
 *   /proxy/aHR0cHM6Ly9wb3J0YWwud2Vnby1zdGFnaW5nLndlZ29yZW1pdC5jb20=/dashboard
 *   -> fetches https://portal.wego-staging.wegoremit.com/dashboard
 *
 * For HTML responses it:
 *  - Strips X-Frame-Options & CSP
 *  - Injects <base> so relative URLs resolve through the proxy
 *  - Injects fetch/XHR overrides for cross-origin API calls
 *  - Injects the recording script
 *  - Rewrites Set-Cookie domains
 */
import { Hono } from 'hono';
import type { Env } from './env';
import { b64Encode, b64Decode } from './proxy-helpers';
import { proxyFetch } from './proxy-fetch';
import { requireAuth } from './auth';
import { rateLimit } from './ratelimit';

const proxy = new Hono<{ Bindings: Env; Variables: { userId?: string; userEmail?: string } }>();

// ── Auth & rate limiting ─────────────────────────────────────
proxy.use('*', requireAuth());
proxy.use('*', rateLimit(30, 60_000));

// ── SSRF protection ──────────────────────────────────────────

/** RFC 1918 / loopback / link-local patterns for SSRF blocking. */
const PRIVATE_IP_RE =
  /^(127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|0\.0\.0\.0|169\.254\.\d+\.\d+|\[::1\]|\[fc00:)/i;

/**
 * Validate that a decoded origin is an allowed proxy target.
 * Rejects non-HTTPS in production and private/loopback addresses.
 *
 * TODO: Implement project-scoped allowlisting — only allow origins
 *       that match the authenticated user's project `base_url`.
 */
function validateOrigin(raw: string): { valid: true; url: URL } | { valid: false; reason: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { valid: false, reason: 'Decoded origin is not a valid URL.' };
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { valid: false, reason: 'Only HTTP(S) origins are allowed.' };
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || PRIVATE_IP_RE.test(hostname)) {
    return { valid: false, reason: 'Private or loopback addresses are not allowed.' };
  }

  return { valid: true, url };
}

// ── Catch-all proxy route ────────────────────────────────────
// Matches:  /proxy/<b64origin>/any/path?query
proxy.all('/:b64origin{[A-Za-z0-9_-]+}/*', async (c) => {
  const b64origin = c.req.param('b64origin');
  const rest = c.req.path.split('/').slice(3).join('/');

  let targetOrigin: string;
  try {
    targetOrigin = b64Decode(b64origin);
  } catch {
    return c.json({ error: 'Invalid base64 origin' }, 400);
  }

  const check = validateOrigin(targetOrigin);
  if (!check.valid) {
    return c.json({ error: 'origin_not_allowed', message: check.reason }, 403);
  }

  const url = new URL(c.req.url);
  const targetUrl = targetOrigin + '/' + rest + (url.search || '');
  return proxyFetch(c, targetUrl, targetOrigin, b64origin);
});

// Also handle root path:  /proxy/<b64origin>  (no trailing slash)
proxy.all('/:b64origin{[A-Za-z0-9_-]+}', async (c) => {
  const b64origin = c.req.param('b64origin');

  let targetOrigin: string;
  try {
    targetOrigin = b64Decode(b64origin);
  } catch {
    return c.json({ error: 'Invalid base64 origin' }, 400);
  }

  const check = validateOrigin(targetOrigin);
  if (!check.valid) {
    return c.json({ error: 'origin_not_allowed', message: check.reason }, 403);
  }

  const url = new URL(c.req.url);
  const targetUrl = targetOrigin + '/' + (url.search || '');
  return proxyFetch(c, targetUrl, targetOrigin, b64origin);
});

// Legacy ?url= support (redirects to path-based)
proxy.get('/', async (c) => {
  const targetUrl = c.req.query('url');
  if (!targetUrl) return c.json({ error: 'url parameter required' }, 400);
  try {
    const parsed = new URL(targetUrl);
    const b64 = b64Encode(parsed.origin);
    const path = parsed.pathname + parsed.search;
    return c.redirect(`/proxy/${b64}${path}`);
  } catch {
    return c.json({ error: 'Invalid URL' }, 400);
  }
});

export { proxy };

/**
 * Core proxy fetch logic.
 *
 * Fetches the target URL, handles redirects, strips security headers,
 * rewrites cookies, and delegates HTML/CSS rewriting to proxy-rewrite.
 */
import { b64Encode } from './proxy-helpers';
import { rewriteHtml, rewriteCss } from './proxy-rewrite';

/** Fetch target URL and rewrite the response for the proxy. */
export async function proxyFetch(
  c: any,
  targetUrl: string,
  targetOrigin: string,
  b64origin: string
): Promise<Response> {
  try {
    const incomingHeaders = buildIncomingHeaders(c, targetOrigin);

    const fetchOpts: RequestInit = {
      method: c.req.method,
      headers: incomingHeaders,
      redirect: 'manual',
    };

    if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      fetchOpts.body = await c.req.arrayBuffer();
    }

    const response = await fetch(targetUrl, fetchOpts);

    // Handle redirects — rewrite Location to stay in proxy
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      return handleRedirect(c, response, targetUrl, targetOrigin, b64origin);
    }

    const contentType = response.headers.get('content-type') || '';
    const headers = buildResponseHeaders(response);

    if (contentType.includes('text/html')) {
      return rewriteHtml(c, response, headers, b64origin, targetOrigin);
    }

    if (contentType.includes('text/css')) {
      return rewriteCss(response, headers, b64origin, targetOrigin);
    }

    // Non-HTML/CSS: pass through
    const body = await response.arrayBuffer();
    return new Response(body, { status: response.status, headers });
  } catch (err: any) {
    return c.json({ error: 'proxy_error', message: 'Failed to fetch the target URL.' }, 502);
  }
}

// ── Header builders ────────────────────────────────────────────

function buildIncomingHeaders(c: any, targetOrigin: string): Record<string, string> {
  const h: Record<string, string> = {
    'User-Agent':
      c.req.header('user-agent') ||
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    Accept: c.req.header('accept') || '*/*',
    'Accept-Language': c.req.header('accept-language') || 'en-US,en;q=0.5',
    Referer: targetOrigin + '/',
    Origin: targetOrigin,
  };
  const cookie = c.req.header('cookie');
  if (cookie) h['Cookie'] = cookie;
  const ct = c.req.header('content-type');
  if (ct) h['Content-Type'] = ct;
  return h;
}

const STRIP_HEADERS = new Set([
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'content-encoding',
  'content-length',
]);

function buildResponseHeaders(response: Response): Headers {
  const headers = new Headers();

  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (STRIP_HEADERS.has(lower)) return;
    if (lower === 'set-cookie') {
      const cleaned = value
        .replace(/;\s*[Dd]omain=[^;]*/g, '')
        .replace(/;\s*[Ss]ecure/g, '')
        .replace(/;\s*[Ss]ame[Ss]ite=[^;]*/g, '; SameSite=None');
      headers.append(key, cleaned);
      return;
    }
    headers.set(key, value);
  });

  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Credentials', 'true');
  return headers;
}

// ── Redirect handling ──────────────────────────────────────────

function handleRedirect(
  c: any,
  response: Response,
  targetUrl: string,
  targetOrigin: string,
  b64origin: string
): Response {
  const location = response.headers.get('location');
  if (!location) {
    return new Response(null, { status: response.status });
  }

  let newLoc: string;
  try {
    const abs = new URL(location, targetUrl);
    if (abs.origin === targetOrigin) {
      newLoc = `/proxy/${b64origin}${abs.pathname}${abs.search}`;
    } else {
      const newB64 = b64Encode(abs.origin);
      newLoc = `/proxy/${newB64}${abs.pathname}${abs.search}`;
    }
  } catch {
    newLoc = location;
  }
  return c.redirect(newLoc, response.status as 301);
}

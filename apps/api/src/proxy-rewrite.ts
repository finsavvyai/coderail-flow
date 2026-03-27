/**
 * HTML and CSS response rewriting for the reverse proxy.
 *
 * Injects <base> tags, recording scripts, and rewrites URLs
 * so that all resources route through the proxy.
 */
import { buildRecordingScript } from './proxy-recording';

// ── HTML rewriting ─────────────────────────────────────────────

export async function rewriteHtml(
  c: any,
  response: Response,
  headers: Headers,
  b64origin: string,
  targetOrigin: string
): Promise<Response> {
  let html = await response.text();
  const apiOrigin = new URL(c.req.url).origin;
  const proxyPrefix = `${apiOrigin}/proxy/${b64origin}`;
  const baseTag = `<base href="${proxyPrefix}/">`;
  const scripts = buildRecordingScript(proxyPrefix, targetOrigin);

  html = injectBaseTag(html, baseTag);
  html = html.replace(/<base\s+href="(?!.*\/proxy\/).*?"[^>]*>/gi, '');

  const proxyPath = `/proxy/${b64origin}`;
  html = html.replace(/((?:src|href|action)\s*=\s*["'])\/((?!\/|proxy\/))/gi, `$1${proxyPath}/$2`);

  html = injectScripts(html, scripts);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(html, { status: response.status, headers });
}

function injectBaseTag(html: string, baseTag: string): string {
  if (html.includes('<head>')) {
    return html.replace('<head>', `<head>${baseTag}`);
  }
  if (html.includes('<HEAD>')) {
    return html.replace('<HEAD>', `<HEAD>${baseTag}`);
  }
  if (html.includes('<html')) {
    return html.replace(/<html[^>]*>/, `$&<head>${baseTag}</head>`);
  }
  return baseTag + html;
}

function injectScripts(html: string, scripts: string): string {
  if (html.includes('</body>')) {
    return html.replace('</body>', `${scripts}</body>`);
  }
  if (html.includes('</BODY>')) {
    return html.replace('</BODY>', `${scripts}</BODY>`);
  }
  return html + scripts;
}

// ── CSS rewriting ──────────────────────────────────────────────

export async function rewriteCss(
  response: Response,
  headers: Headers,
  b64origin: string,
  targetOrigin: string
): Promise<Response> {
  let css = await response.text();
  const proxyPath = `/proxy/${b64origin}`;
  css = css.replace(/url\(\s*(['"]?)\/((?!\/|proxy\/))/gi, `url($1${proxyPath}/$2`);
  const escaped = targetOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  css = css.replace(new RegExp(`url\\(\\s*(['"]?)${escaped}/`, 'gi'), `url($1${proxyPath}/`);
  headers.set('Content-Type', 'text/css; charset=utf-8');
  return new Response(css, { status: response.status, headers });
}

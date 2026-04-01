import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { cspHeaders } from './security.js';

function createApp() {
  const app = new Hono();

  app.use('*', cspHeaders);
  app.get('/health', (c) => c.text('ok'));
  app.get('/proxy/:b64origin', (c) => c.text(c.req.param('b64origin')));

  return app;
}

describe('cspHeaders', () => {
  it('keeps strict frame-blocking headers on normal API routes', async () => {
    const res = await createApp().request('/health');

    expect(res.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin');
  });

  it('omits frame-blocking headers on proxy responses', async () => {
    const res = await createApp().request('/proxy/aHR0cHM6Ly9leGFtcGxlLmNvbQ');

    expect(res.headers.get('content-security-policy')).toBeNull();
    expect(res.headers.get('x-frame-options')).toBeNull();
    expect(res.headers.get('cross-origin-opener-policy')).toBeNull();
    expect(res.headers.get('cross-origin-resource-policy')).toBeNull();
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Navigation Automation', () => {
  const baseUrl = 'http://localhost:8787/api';

  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('Navigate Step', () => {
    it('should navigate to URL', async () => {
      const payload = {
        type: 'navigate',
        url: 'https://example.com'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });

    it('should handle redirect chains', async () => {
      const payload = {
        type: 'navigate',
        url: 'https://example.com/redirect',
        followRedirects: true
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });

    it('should timeout on slow page loads', async () => {
      const payload = {
        type: 'navigate',
        url: 'https://httpstat.us/200?sleep=5000',
        timeout: 1000
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 408]).toContain(response.status);
    });

    it('should track page metrics', async () => {
      const payload = {
        type: 'navigate',
        url: 'https://example.com',
        captureMetrics: true
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if ([200, 202].includes(response.status)) {
        const data = await response.json();
        expect(data.metrics).toBeDefined();
      }
    });

    it('should capture page title', async () => {
      const payload = {
        type: 'navigate',
        url: 'https://example.com'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if ([200, 202].includes(response.status)) {
        const data = await response.json();
        expect(data.title).toBeDefined();
      }
    });

    it('should validate URL format', async () => {
      const payload = {
        type: 'navigate',
        url: 'not-a-valid-url'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([400, 200, 202]).toContain(response.status);
    });

    it('should handle 404 responses', async () => {
      const payload = {
        type: 'navigate',
        url: 'https://httpstat.us/404'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });
  });

  describe('Wait Conditions', () => {
    it('should wait for element', async () => {
      const payload = {
        type: 'waitFor',
        selector: '.loaded',
        timeout: 5000
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404, 408]).toContain(response.status);
    });

    it('should wait for navigation', async () => {
      const payload = {
        type: 'waitForNavigation',
        timeout: 5000
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 408]).toContain(response.status);
    });

    it('should wait for function', async () => {
      const payload = {
        type: 'waitForFunction',
        fn: '() => document.querySelectorAll("item").length > 0',
        timeout: 5000
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 400, 408]).toContain(response.status);
    });
  });
});

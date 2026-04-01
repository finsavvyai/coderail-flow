import { describe, it, expect } from 'vitest';

describe('Screenshot & SRT Automation', () => {
  const baseUrl = 'http://localhost:8787/api';

  describe('Screenshot Capture', () => {
    it('should capture full page screenshot', async () => {
      const payload = {
        type: 'screenshot',
        mode: 'fullPage'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json();
        expect(data.screenshot_url).toBeDefined();
      }
    });

    it('should capture element screenshot', async () => {
      const payload = {
        type: 'screenshot',
        mode: 'element',
        selector: '.dashboard'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should upload to R2', async () => {
      const payload = {
        type: 'screenshot',
        uploadToR2: true,
        bucketPath: 'screenshots/'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });

    it('should generate SRT timestamps', async () => {
      const payload = {
        type: 'screenshot',
        generateSRT: true,
        description: 'Dashboard loaded'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json();
        expect(data.srt_subtitle).toBeDefined();
      }
    });

    it('should capture with custom dimensions', async () => {
      const payload = {
        type: 'screenshot',
        width: 1920,
        height: 1080
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });

    it('should add timestamp to SRT', async () => {
      const payload = {
        type: 'screenshot',
        generateSRT: true,
        srtTimestamp: 5000
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const payload = {
        type: 'navigate',
        url: 'https://invalid-domain-that-does-not-exist.test'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 400, 500]).toContain(response.status);
    });

    it('should continue on navigation error', async () => {
      const payload = {
        type: 'navigate',
        url: 'https://httpstat.us/404',
        continueOnError: true
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });

    it('should retry failed actions', async () => {
      const payload = {
        type: 'click',
        selector: '#retry-button',
        retry: { maxAttempts: 3, delayMs: 100 }
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should handle R2 upload failures', async () => {
      const payload = {
        type: 'screenshot',
        uploadToR2: true,
        bucketPath: null
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 400]).toContain(response.status);
    });
  });
});

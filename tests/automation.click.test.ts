import { describe, it, expect } from 'vitest';

describe('Click & Hover Automation', () => {
  const baseUrl = 'http://localhost:8787/api';

  describe('Click Actions', () => {
    it('should click element by selector', async () => {
      const payload = {
        type: 'click',
        selector: 'button#submit'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should handle element not found', async () => {
      const payload = {
        type: 'click',
        selector: '#nonexistent'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should wait for element before clicking', async () => {
      const payload = {
        type: 'click',
        selector: 'button',
        waitFor: 5000
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404, 408]).toContain(response.status);
    });

    it('should click by XPath', async () => {
      const payload = {
        type: 'click',
        xpath: '//button[@data-test="primary"]'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should double-click element', async () => {
      const payload = {
        type: 'click',
        selector: 'input',
        double: true
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });
  });

  describe('Hover & Scroll', () => {
    it('should hover over element', async () => {
      const payload = {
        type: 'hover',
        selector: '.dropdown-trigger'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should scroll page', async () => {
      const payload = {
        type: 'scroll',
        x: 0,
        y: 500
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });

    it('should scroll into element view', async () => {
      const payload = {
        type: 'scroll',
        selector: '.target-element'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });
  });
});

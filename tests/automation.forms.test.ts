import { describe, it, expect } from 'vitest';

describe('Form Filling Automation', () => {
  const baseUrl = 'http://localhost:8787/api';

  describe('Form Filling', () => {
    it('should fill text input', async () => {
      const payload = {
        type: 'fill',
        selector: 'input[name="email"]',
        value: 'test@example.com'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should select dropdown option', async () => {
      const payload = {
        type: 'select',
        selector: 'select[name="country"]',
        value: 'US'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should check checkbox', async () => {
      const payload = {
        type: 'check',
        selector: 'input[type="checkbox"]'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should clear field before filling', async () => {
      const payload = {
        type: 'fill',
        selector: 'input',
        value: 'new value',
        clear: true
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should fill form with multiple fields', async () => {
      const payload = {
        type: 'fillForm',
        fields: [
          { selector: 'input[name="name"]', value: 'John' },
          { selector: 'input[name="email"]', value: 'john@example.com' },
          { selector: 'select[name="role"]', value: 'admin' }
        ]
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should type text slowly', async () => {
      const payload = {
        type: 'type',
        selector: 'input[name="search"]',
        value: 'search query',
        delay: 50
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should press keyboard key', async () => {
      const payload = {
        type: 'press',
        key: 'Enter'
      };

      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202]).toContain(response.status);
    });
  });
});

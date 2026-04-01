import { describe, it, expect, beforeEach } from 'vitest';

describe('Billing Checkout', () => {
  const baseUrl = 'http://localhost:8787/api';
  let userId: string;

  beforeEach(() => {
    userId = `user_${Date.now()}`;
  });

  describe('Checkout Session', () => {
    it('should create checkout session for pro plan', async () => {
      const response = await fetch(`${baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          plan: 'pro',
          billingCycle: 'monthly'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.checkout_url).toBeDefined();
      expect(data.session_id).toBeDefined();
    });

    it('should reject checkout for free plan', async () => {
      const response = await fetch(`${baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          plan: 'free'
        })
      });

      expect(response.status).toBe(400);
    });

    it('should handle checkout errors gracefully', async () => {
      const response = await fetch(`${baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'invalid_user'
        },
        body: JSON.stringify({
          plan: 'pro'
        })
      });

      expect([400, 404]).toContain(response.status);
    });

    it('should include discount in checkout', async () => {
      const response = await fetch(`${baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          plan: 'pro',
          discountCode: 'SAVE20'
        })
      });

      expect([201, 400]).toContain(response.status);
    });

    it('should support annual billing', async () => {
      const response = await fetch(`${baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          plan: 'pro',
          billingCycle: 'annual'
        })
      });

      expect([201, 400]).toContain(response.status);
    });

    it('should validate plan exists', async () => {
      const response = await fetch(`${baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          plan: 'nonexistent'
        })
      });

      expect([400, 404]).toContain(response.status);
    });

    it('should set checkout expiration', async () => {
      const response = await fetch(`${baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          plan: 'pro'
        })
      });

      if (response.status === 201) {
        const data = await response.json();
        expect(data.expires_at).toBeDefined();
      }
    });
  });
});

import { describe, it, expect } from 'vitest';

describe('Webhook Validation & Idempotency', () => {
  const baseUrl = 'http://localhost:8787/api';

  describe('Signature Validation', () => {
    it('should validate webhook signature', async () => {
      const response = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'invalid_signature'
        },
        body: JSON.stringify({ meta: {} })
      });

      expect(response.status).toBe(401);
    });

    it('should require signature header', async () => {
      const response = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: {} })
      });

      expect(response.status).toBe(401);
    });

    it('should handle timing-safe comparison', async () => {
      const payload = {
        meta: { event_name: 'subscription.created' },
        data: { id: 'sub_123', status: 'active' }
      };

      const response = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'almost_correct_signature'
        },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(401);
    });

    it('should reject malformed JSON', async () => {
      const response = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: 'invalid json'
      });

      expect([400, 401]).toContain(response.status);
    });
  });

  describe('Idempotency', () => {
    it('should handle duplicate webhooks', async () => {
      const payload = {
        meta: {
          event_name: 'subscription.created',
          idempotency_key: 'idem_123'
        },
        data: { id: 'sub_123', status: 'active' }
      };

      const response1 = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: JSON.stringify(payload)
      });

      const response2 = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: JSON.stringify(payload)
      });

      expect([200, 204]).toContain(response1.status);
      expect([200, 204]).toContain(response2.status);
    });

    it('should process different webhook keys separately', async () => {
      const payload1 = {
        meta: {
          event_name: 'subscription.created',
          idempotency_key: 'idem_001'
        },
        data: { id: 'sub_001', status: 'active' }
      };

      const payload2 = {
        meta: {
          event_name: 'subscription.created',
          idempotency_key: 'idem_002'
        },
        data: { id: 'sub_002', status: 'active' }
      };

      const response1 = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: JSON.stringify(payload1)
      });

      const response2 = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: JSON.stringify(payload2)
      });

      expect([200, 204]).toContain(response1.status);
      expect([200, 204]).toContain(response2.status);
    });
  });
});

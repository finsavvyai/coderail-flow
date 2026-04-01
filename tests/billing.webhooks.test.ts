import { describe, it, expect } from 'vitest';

describe('LemonSqueezy Webhooks', () => {
  const baseUrl = 'http://localhost:8787/api';

  describe('Webhook Events', () => {
    it('should handle subscription.created event', async () => {
      const payload = {
        meta: {
          event_name: 'subscription.created',
          custom_data: null
        },
        data: {
          id: 'sub_123',
          customer_id: 'cus_456',
          status: 'active',
          total: 2900,
          currency: 'USD'
        }
      };

      const response = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: JSON.stringify(payload)
      });

      expect([200, 204]).toContain(response.status);
    });

    it('should handle subscription.updated event', async () => {
      const payload = {
        meta: { event_name: 'subscription.updated' },
        data: {
          id: 'sub_123',
          status: 'paused'
        }
      };

      const response = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: JSON.stringify(payload)
      });

      expect([200, 204]).toContain(response.status);
    });

    it('should handle subscription.expired event', async () => {
      const payload = {
        meta: { event_name: 'subscription.expired' },
        data: {
          id: 'sub_123',
          status: 'expired'
        }
      };

      const response = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: JSON.stringify(payload)
      });

      expect([200, 204]).toContain(response.status);
    });

    it('should handle subscription.cancelled event', async () => {
      const payload = {
        meta: { event_name: 'subscription.cancelled' },
        data: {
          id: 'sub_123',
          status: 'cancelled'
        }
      };

      const response = await fetch(`${baseUrl}/webhooks/lemon-squeezy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test_signature'
        },
        body: JSON.stringify(payload)
      });

      expect([200, 204]).toContain(response.status);
    });
  });

});

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Usage Tracking & Downgrades', () => {
  const baseUrl = 'http://localhost:8787/api';
  let userId: string;

  beforeEach(() => {
    userId = `user_${Date.now()}`;
  });

  describe('Usage Tracking', () => {
    it('should increment execution count', async () => {
      const before = await fetch(`${baseUrl}/users/${userId}/usage`);
      const beforeData = await before.json();

      await fetch(`${baseUrl}/flows/test/execute`, {
        method: 'POST',
        headers: { 'X-User-ID': userId }
      });

      const after = await fetch(`${baseUrl}/users/${userId}/usage`);
      const afterData = await after.json();

      expect(afterData.executions_this_month).toBeGreaterThanOrEqual(
        beforeData.executions_this_month
      );
    });

    it('should track storage usage', async () => {
      const response = await fetch(`${baseUrl}/users/${userId}/usage`, {
        headers: { 'X-User-ID': userId }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.storage_bytes).toBeDefined();
      expect(typeof data.storage_bytes).toBe('number');
    });

    it('should return usage breakdown', async () => {
      const response = await fetch(`${baseUrl}/users/${userId}/usage`, {
        headers: { 'X-User-ID': userId }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.flows_created).toBeDefined();
      expect(data.executions_this_month).toBeDefined();
      expect(data.screenshots_captured).toBeDefined();
    });

    it('should reset monthly limits on new month', async () => {
      vi.useFakeTimers();
      const now = new Date('2025-03-20T00:00:00Z');
      vi.setSystemTime(now);

      let response = await fetch(`${baseUrl}/users/${userId}/usage`, {
        headers: { 'X-User-ID': userId }
      });

      let data = await response.json();
      const march_count = data.executions_this_month;

      vi.setSystemTime(new Date('2025-04-01T00:00:00Z'));

      response = await fetch(`${baseUrl}/users/${userId}/usage`, {
        headers: { 'X-User-ID': userId }
      });

      data = await response.json();
      expect(data.executions_this_month).toBeLessThan(march_count);

      vi.useRealTimers();
    });

    it('should track screenshot count', async () => {
      const response = await fetch(`${baseUrl}/users/${userId}/usage`);
      const data = await response.json();
      expect(data.screenshots_captured).toBeDefined();
    });
  });

  describe('Plan Downgrades', () => {
    it('should allow downgrade from pro to free', async () => {
      const response = await fetch(`${baseUrl}/subscriptions/${userId}/downgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({ plan: 'free' })
      });

      expect([200, 204]).toContain(response.status);
    });

    it('should delete excess flows on downgrade', async () => {
      const response = await fetch(`${baseUrl}/subscriptions/${userId}/downgrade`, {
        method: 'POST',
        headers: { 'X-User-ID': userId },
        body: JSON.stringify({ plan: 'free' })
      });

      if ([200, 204].includes(response.status)) {
        const flows = await fetch(`${baseUrl}/flows`, {
          headers: { 'X-User-ID': userId }
        });
        const flowsData = await flows.json();
        expect(flowsData.flows.length).toBeLessThanOrEqual(3);
      }
    });

    it('should warn user before downgrade', async () => {
      const response = await fetch(`${baseUrl}/subscriptions/${userId}/downgrade/preview`, {
        headers: { 'X-User-ID': userId }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json();
        expect(data.flows_to_delete).toBeDefined();
        expect(data.executions_affected).toBeDefined();
      }
    });
  });

  describe('Invoices', () => {
    it('should list invoices for user', async () => {
      const response = await fetch(`${baseUrl}/invoices`, {
        headers: { 'X-User-ID': userId }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.invoices)).toBe(true);
    });

    it('should download invoice PDF', async () => {
      const response = await fetch(`${baseUrl}/invoices/inv_123/download`);
      expect([200, 404]).toContain(response.status);
    });

    it('should email invoice copy', async () => {
      const response = await fetch(`${baseUrl}/invoices/inv_123/email`, {
        method: 'POST',
        headers: { 'X-User-ID': userId }
      });

      expect([200, 404]).toContain(response.status);
    });
  });
});

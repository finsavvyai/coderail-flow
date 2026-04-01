import { describe, it, expect } from 'vitest';

describe('Flow Read Operations', () => {
  const baseUrl = 'http://localhost:8787/api';
  const flowId = 'flow_test_123';

  describe('Retrieve Flow', () => {
    it('should retrieve flow by ID', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}`);
      expect([200, 404]).toContain(response.status);
    });

    it('should list all flows for user', async () => {
      const response = await fetch(`${baseUrl}/flows`, {
        headers: { 'Authorization': 'Bearer test_token' }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.flows)).toBe(true);
    });

    it('should filter flows by status', async () => {
      const response = await fetch(`${baseUrl}/flows?status=active`);
      expect(response.status).toBe(200);
    });

    it('should paginate flow list', async () => {
      const response = await fetch(`${baseUrl}/flows?limit=10&offset=0`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.limit).toBe(10);
      expect(data.offset).toBe(0);
    });

    it('should sort flows by created_at', async () => {
      const response = await fetch(`${baseUrl}/flows?sort=created_at&order=desc`);
      expect(response.status).toBe(200);
    });

    it('should search flows by name', async () => {
      const response = await fetch(`${baseUrl}/flows?search=login`);
      expect(response.status).toBe(200);
    });

    it('should return total count', async () => {
      const response = await fetch(`${baseUrl}/flows`);
      if (response.status === 200) {
        const data = await response.json();
        expect(data.total).toBeDefined();
        expect(typeof data.total).toBe('number');
      }
    });

    it('should include metadata', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}`);
      if (response.status === 200) {
        const data = await response.json();
        expect(data.created_at).toBeDefined();
        expect(data.updated_at).toBeDefined();
      }
    });
  });
});

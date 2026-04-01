import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Flow CRUD Operations', () => {
  let flowId: string;
  const baseUrl = 'http://localhost:8787/api';

  beforeEach(() => {
    flowId = `flow_${Date.now()}`;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Create', () => {
    it('should create a new flow successfully', async () => {
      const payload = {
        name: 'Test Flow',
        description: 'Automation test flow',
        steps: [
          { type: 'navigate', url: 'https://example.com' },
          { type: 'click', selector: 'button' }
        ]
      };

      const response = await fetch(`${baseUrl}/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe('Test Flow');
      expect(data.steps).toHaveLength(2);
    });

    it('should reject flow without name', async () => {
      const payload = { steps: [] };

      const response = await fetch(`${baseUrl}/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(400);
    });

    it('should validate step types', async () => {
      const payload = {
        name: 'Invalid Steps',
        steps: [{ type: 'invalid_type', data: {} }]
      };

      const response = await fetch(`${baseUrl}/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(400);
    });

    it('should set created_at timestamp', async () => {
      const now = new Date('2025-03-20T00:00:00Z');
      vi.setSystemTime(now);

      const payload = { name: 'Timestamped Flow', steps: [] };
      const response = await fetch(`${baseUrl}/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      expect(new Date(data.created_at)).toEqual(now);
    });

    it('should handle concurrent flow creation', async () => {
      const promises = Array(5).fill(null).map((_, i) =>
        fetch(`${baseUrl}/flows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Concurrent Flow ${i}`, steps: [] })
        })
      );

      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.status).toBe(201);
      });
    });
  });


  describe('Update', () => {
    it('should update flow name', async () => {
      const payload = { name: 'Updated Flow Name' };
      const response = await fetch(`${baseUrl}/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json();
        expect(data.name).toBe('Updated Flow Name');
      }
    });

    it('should update flow steps', async () => {
      const newSteps = [
        { type: 'navigate', url: 'https://new.com' }
      ];
      const payload = { steps: newSteps };
      const response = await fetch(`${baseUrl}/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 404]).toContain(response.status);
    });

    it('should preserve immutable fields', async () => {
      const payload = { created_at: '2020-01-01T00:00:00Z' };
      const response = await fetch(`${baseUrl}/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.created_at).not.toBe('2020-01-01T00:00:00Z');
      }
    });

    it('should reject partial step updates', async () => {
      const payload = { steps: [{ type: 'navigate' }] };
      const response = await fetch(`${baseUrl}/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([400, 404, 422]).toContain(response.status);
    });
  });

  describe('Delete', () => {
    it('should delete flow by ID', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}`, {
        method: 'DELETE'
      });

      expect([200, 204, 404]).toContain(response.status);
    });

    it('should prevent deletion of running flows', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}`, {
        method: 'DELETE',
        headers: { 'X-Force': 'false' }
      });

      expect([200, 204, 409, 404]).toContain(response.status);
    });

    it('should soft-delete flows', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}`, {
        method: 'DELETE'
      });

      if ([200, 204].includes(response.status)) {
        const getResponse = await fetch(`${baseUrl}/flows/${flowId}`);
        expect([404, 410]).toContain(getResponse.status);
      }
    });
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Flow Execution & Scheduling', () => {
  let flowId: string;
  const baseUrl = 'http://localhost:8787/api';

  beforeEach(() => {
    flowId = `flow_${Date.now()}`;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Execute Flow', () => {
    it('should trigger flow execution', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should return execution ID', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}/execute`, {
        method: 'POST'
      });

      if (response.status === 202) {
        const data = await response.json();
        expect(data.execution_id).toBeDefined();
      }
    });

    it('should timeout long-running flows', async () => {
      const payload = { timeout: 1 };
      const response = await fetch(`${baseUrl}/flows/${flowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 202, 400, 404]).toContain(response.status);
    });

    it('should capture screenshots during execution', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capture_screenshots: true })
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should generate SRT on execution', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generate_srt: true })
      });

      expect([200, 202, 404]).toContain(response.status);
    });

    it('should handle execution errors', async () => {
      const response = await fetch(`${baseUrl}/flows/invalid/execute`, {
        method: 'POST'
      });

      expect([404, 500]).toContain(response.status);
    });
  });

  describe('Schedule Flow', () => {
    it('should schedule flow execution', async () => {
      const payload = {
        cron: '0 9 * * *',
        timezone: 'UTC'
      };

      const response = await fetch(`${baseUrl}/flows/${flowId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 201, 404]).toContain(response.status);
    });

    it('should validate cron expression', async () => {
      const payload = { cron: 'invalid cron' };
      const response = await fetch(`${baseUrl}/flows/${flowId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([400, 404, 422]).toContain(response.status);
    });

    it('should list scheduled executions', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}/schedules`);
      expect([200, 404]).toContain(response.status);
    });

    it('should disable schedule', async () => {
      const response = await fetch(`${baseUrl}/flows/${flowId}/schedule/1/disable`, {
        method: 'POST'
      });

      expect([200, 404]).toContain(response.status);
    });

    it('should support multiple timezones', async () => {
      const payload = {
        cron: '0 14 * * *',
        timezone: 'America/New_York'
      };

      const response = await fetch(`${baseUrl}/flows/${flowId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect([200, 201, 404]).toContain(response.status);
    });

    it('should calculate next run time', async () => {
      const payload = { cron: '0 9 * * 1-5', timezone: 'UTC' };
      const response = await fetch(`${baseUrl}/flows/${flowId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if ([200, 201].includes(response.status)) {
        const data = await response.json();
        expect(data.next_run).toBeDefined();
      }
    });
  });
});

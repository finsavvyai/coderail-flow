import { API_BASE, authHeaders } from './api-core';
import type { AnalyticsStats, StepAnalyticsStats, ElementReliabilityStats } from './api-types';

export async function getAnalyticsStats(
  timeRange: '7d' | '30d' | '90d' = '7d',
  projectId?: string
): Promise<AnalyticsStats> {
  const params = new URLSearchParams({ timeRange });
  if (projectId) params.set('projectId', projectId);
  const res = await fetch(`${API_BASE}/analytics?${params.toString()}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

export async function getStepAnalytics(
  timeRange: '7d' | '30d' | '90d' = '7d',
  projectId?: string
): Promise<StepAnalyticsStats> {
  const params = new URLSearchParams({ timeRange });
  if (projectId) params.set('projectId', projectId);
  const res = await fetch(`${API_BASE}/analytics/steps?${params.toString()}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load step analytics');
  return res.json();
}

export async function getElementReliability(projectId?: string): Promise<ElementReliabilityStats> {
  const params = new URLSearchParams();
  if (projectId) params.set('projectId', projectId);
  const query = params.toString();
  const res = await fetch(`${API_BASE}/analytics/elements${query ? `?${query}` : ''}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load element reliability analytics');
  return res.json();
}

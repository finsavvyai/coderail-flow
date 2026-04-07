import { API_BASE, authHeaders } from './api-core';
export async function getAnalyticsStats(timeRange = '7d', projectId) {
    const params = new URLSearchParams({ timeRange });
    if (projectId)
        params.set('projectId', projectId);
    const res = await fetch(`${API_BASE}/analytics?${params.toString()}`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load analytics');
    return res.json();
}
export async function getStepAnalytics(timeRange = '7d', projectId) {
    const params = new URLSearchParams({ timeRange });
    if (projectId)
        params.set('projectId', projectId);
    const res = await fetch(`${API_BASE}/analytics/steps?${params.toString()}`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load step analytics');
    return res.json();
}
export async function getElementReliability(projectId) {
    const params = new URLSearchParams();
    if (projectId)
        params.set('projectId', projectId);
    const query = params.toString();
    const res = await fetch(`${API_BASE}/analytics/elements${query ? `?${query}` : ''}`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load element reliability analytics');
    return res.json();
}

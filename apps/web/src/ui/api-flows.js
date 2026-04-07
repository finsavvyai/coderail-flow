import { API_BASE, authHeaders } from './api-core';
export async function getFlows() {
    const res = await fetch(`${API_BASE}/flows`, { headers: await authHeaders() });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Failed to load flows (${res.status})`);
    }
    const json = await res.json();
    return json.flows ?? [];
}
export async function createFlow(data) {
    const res = await fetch(`${API_BASE}/flows`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to create flow');
    }
    const json = await res.json();
    return json.flow;
}
export async function updateFlow(flowId, data) {
    const res = await fetch(`${API_BASE}/flows/${flowId}`, {
        method: 'PUT',
        headers: await authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to update flow');
    }
    const json = await res.json();
    return json.flow;
}
export async function getTemplates() {
    const res = await fetch(`${API_BASE}/templates`, { headers: await authHeaders() });
    if (!res.ok)
        throw new Error('Failed to load templates');
    const json = await res.json();
    return json.templates ?? [];
}
export async function createFlowFromTemplate(data) {
    const res = await fetch(`${API_BASE}/flows/from-template`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to create flow from template');
    }
    return res.json();
}
export async function getAuthProfiles(projectId) {
    const res = await fetch(`${API_BASE}/auth-profiles?projectId=${encodeURIComponent(projectId)}`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load auth profiles');
    const json = await res.json();
    return json.profiles ?? [];
}

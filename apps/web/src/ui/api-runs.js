import { API_BASE, authHeaders } from './api-core';
export async function createRun(flowId, params = {}) {
    const res = await fetch(`${API_BASE}/runs`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ flowId, params }),
    });
    if (!res.ok)
        throw new Error('Failed to create run');
    const json = await res.json();
    return json.runId;
}
export async function getRuns() {
    const res = await fetch(`${API_BASE}/runs`, { headers: await authHeaders() });
    if (!res.ok)
        throw new Error('Failed to load runs');
    const json = await res.json();
    return json.runs ?? [];
}
export async function getRun(runId) {
    const res = await fetch(`${API_BASE}/runs/${runId}`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load run');
    return res.json();
}
export async function retryRun(runId) {
    const res = await fetch(`${API_BASE}/runs/${runId}/retry`, {
        method: 'POST',
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to retry run');
}
export function artifactDownloadUrl(artifactId) {
    return `${API_BASE}/artifacts/${artifactId}/download`;
}
export async function fetchArtifactBlobUrl(artifactId) {
    const res = await fetch(`${API_BASE}/artifacts/${artifactId}/preview`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load artifact');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}
export async function fetchArtifactText(artifactId) {
    const res = await fetch(`${API_BASE}/artifacts/${artifactId}/preview`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load artifact');
    return res.text();
}

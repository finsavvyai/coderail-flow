import { API_BASE, authHeaders } from './api-core';
import type { RunRow } from './api-types';

export async function createRun(flowId: string, params: Record<string, any> = {}): Promise<string> {
  const res = await fetch(`${API_BASE}/runs`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ flowId, params }),
  });
  if (!res.ok) throw new Error('Failed to create run');
  const json = await res.json();
  return json.runId;
}

export async function getRuns(): Promise<RunRow[]> {
  const res = await fetch(`${API_BASE}/runs`, { headers: await authHeaders() });
  if (!res.ok) throw new Error('Failed to load runs');
  const json = await res.json();
  return json.runs ?? [];
}

export async function getRun(runId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/runs/${runId}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load run');
  return res.json();
}

export async function retryRun(runId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/runs/${runId}/retry`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retry run');
}

export function artifactDownloadUrl(artifactId: string): string {
  return `${API_BASE}/artifacts/${artifactId}/download`;
}

export async function fetchArtifactBlobUrl(artifactId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/artifacts/${artifactId}/preview`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load artifact');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function fetchArtifactText(artifactId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/artifacts/${artifactId}/preview`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load artifact');
  return res.text();
}

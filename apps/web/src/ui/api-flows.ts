import { API_BASE, authHeaders } from './api-core';
import type { Flow, TemplateSummary, AuthProfile } from './api-types';

export async function getFlows(): Promise<Flow[]> {
  const res = await fetch(`${API_BASE}/flows`, { headers: await authHeaders() });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || `Failed to load flows (${res.status})`);
  }
  const json = (await res.json()) as any;
  return json.flows ?? [];
}

export async function createFlow(data: {
  projectId: string;
  name: string;
  description?: string;
  authProfileId?: string;
  definition: any;
}): Promise<Flow> {
  const res = await fetch(`${API_BASE}/flows`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || 'Failed to create flow');
  }
  const json = (await res.json()) as any;
  return json.flow;
}

export async function updateFlow(
  flowId: string,
  data: {
    name?: string;
    description?: string;
    authProfileId?: string;
    definition?: any;
  }
): Promise<Flow> {
  const res = await fetch(`${API_BASE}/flows/${flowId}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || 'Failed to update flow');
  }
  const json = (await res.json()) as any;
  return json.flow;
}

export async function getTemplates(): Promise<TemplateSummary[]> {
  const res = await fetch(`${API_BASE}/templates`, { headers: await authHeaders() });
  if (!res.ok) throw new Error('Failed to load templates');
  const json = (await res.json()) as any;
  return json.templates ?? [];
}

export async function createFlowFromTemplate(data: {
  templateId: string;
  projectId: string;
  name?: string;
  authProfileId?: string;
  params?: Record<string, any>;
}): Promise<{ flowId: string; versionId: string; templateId: string }> {
  const res = await fetch(`${API_BASE}/flows/from-template`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || 'Failed to create flow from template');
  }
  return res.json() as Promise<{ flowId: string; versionId: string; templateId: string }>;
}

export async function getAuthProfiles(projectId: string): Promise<AuthProfile[]> {
  const res = await fetch(`${API_BASE}/auth-profiles?projectId=${encodeURIComponent(projectId)}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load auth profiles');
  const json = (await res.json()) as any;
  return json.profiles ?? [];
}

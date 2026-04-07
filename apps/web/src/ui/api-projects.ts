import { API_BASE, authHeaders } from './api-core';

export async function getProjects(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load projects');
  const json = (await res.json()) as any;
  return json.projects ?? [];
}

export async function createProject(data: {
  name: string;
  baseUrl: string;
  description?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  const json = (await res.json()) as any;
  return json.project;
}

export async function getScreens(projectId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/screens?projectId=${projectId}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load screens');
  const json = (await res.json()) as any;
  return json.screens ?? [];
}

export async function createScreen(data: {
  projectId: string;
  name: string;
  urlPath: string;
  description?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/screens`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create screen');
  const json = (await res.json()) as any;
  return json.screen;
}

export async function getElements(screenId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/elements?screenId=${screenId}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load elements');
  const json = (await res.json()) as any;
  return json.elements ?? [];
}

export async function createElement(data: {
  screenId: string;
  name: string;
  locatorPrimary: any;
  locatorFallbacks?: any[];
  reliabilityScore?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/elements`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create element');
  const json = (await res.json()) as any;
  return json.element;
}

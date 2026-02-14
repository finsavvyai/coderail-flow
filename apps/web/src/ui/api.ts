const API_BASE = import.meta.env.VITE_API_URL || "/api";

// ---- Token provider ----
// Set by the app root once Clerk is initialized via setTokenProvider()
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenProvider(fn: () => Promise<string | null>) {
  _getToken = fn;
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (_getToken) {
    const token = await _getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ---- Types ----
export type Flow = {
  id: string;
  name: string;
  description?: string;
  current_version: number;
  definition: any;
};

export type RunRow = {
  id: string;
  flow_id: string;
  flow_name: string;
  flow_version: number;
  status: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
};

// ---- API functions ----
export async function getFlows(): Promise<Flow[]> {
  const res = await fetch(`${API_BASE}/flows`, { headers: await authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to load flows (${res.status})`);
  }
  const json = await res.json();
  return json.flows ?? [];
}

export async function createRun(flowId: string, params: Record<string, any> = {}): Promise<string> {
  const res = await fetch(`${API_BASE}/runs`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ flowId, params })
  });
  if (!res.ok) throw new Error("Failed to create run");
  const json = await res.json();
  return json.runId;
}

export async function getRuns(): Promise<RunRow[]> {
  const res = await fetch(`${API_BASE}/runs`, { headers: await authHeaders() });
  if (!res.ok) throw new Error("Failed to load runs");
  const json = await res.json();
  return json.runs ?? [];
}

export async function getRun(runId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/runs/${runId}`, { headers: await authHeaders() });
  if (!res.ok) throw new Error("Failed to load run");
  return res.json();
}

export function artifactDownloadUrl(artifactId: string): string {
  return `${API_BASE}/artifacts/${artifactId}/download`;
}

export async function retryRun(runId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/runs/${runId}/retry`, {
    method: "POST",
    headers: await authHeaders()
  });
  if (!res.ok) throw new Error("Failed to retry run");
}

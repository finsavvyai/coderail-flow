// Jira Cloud API Client with OAuth 2.0
// Handles authentication and core API operations

export interface JiraConfig {
  clientId: string;
  clientSecret: string;
  instanceUrl: string;
  redirectUri: string;
  scopes: string[];
}

export interface JiraTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface JiraIssueFields {
  project: { key: string };
  summary: string;
  description?: string;
  issuetype?: { name: string };
  priority?: { name: string };
  labels?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType: string;
  }>;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
}

/** Generate OAuth 2.0 authorization URL */
export function getJiraAuthUrl(config: JiraConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: state,
  });
  return `${config.instanceUrl}/oauth/authorize?${params.toString()}`;
}

/** Exchange authorization code for access token */
export async function exchangeCodeForToken(config: JiraConfig, code: string): Promise<JiraTokens> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: code,
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(`${config.instanceUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }
  return await response.json();
}

/** Refresh access token */
export async function refreshAccessToken(
  config: JiraConfig,
  refreshToken: string
): Promise<JiraTokens> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${config.instanceUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }
  return await response.json();
}

/** Attach file to Jira issue */
export async function attachFileToIssue(
  config: JiraConfig,
  accessToken: string,
  issueKey: string,
  filename: string,
  content: Buffer | string,
  contentType: string
): Promise<void> {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(buffer)], { type: contentType }), filename);

  const response = await fetch(`${config.instanceUrl}/rest/api/3/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Atlassian-Token': 'no-check',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to attach file: ${error}`);
  }
}

/** Add comment to Jira issue */
export async function addJiraComment(
  config: JiraConfig,
  accessToken: string,
  issueKey: string,
  comment: string
): Promise<void> {
  const response = await fetch(`${config.instanceUrl}/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: comment }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add comment: ${error}`);
  }
}

// Re-export issue operations for backwards compatibility
export {
  createJiraIssue,
  updateIssueStatus,
  formatRunAsJiraDescription,
  mapRunStatusToTransition,
} from './jira-client-issues';

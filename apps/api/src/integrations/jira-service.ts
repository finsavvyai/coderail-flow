// Jira Integration Service
// Handles integration between CodeRail runs and Jira issues

import { Context } from 'hono';
import {
  createJiraIssue,
  addJiraComment,
  formatRunAsJiraDescription,
  type JiraConfig,
  type JiraIssueFields,
} from './jira-client';

export interface JiraIntegrationConfig {
  project_id: string;
  instance_url: string;
  client_id: string;
  client_secret: string;
  access_token?: string;
  refresh_token?: string;
  enabled: boolean;
  project_key: string;
  issue_type?: string;
  auto_create_on_failure?: boolean;
}

/** Create Jira integration configuration */
export async function createJiraIntegration(
  c: Context<{ Bindings: Env }>,
  projectId: string,
  config: {
    instance_url: string;
    client_id: string;
    client_secret: string;
    project_key: string;
    issue_type?: string;
    auto_create_on_failure?: boolean;
  }
): Promise<void> {
  await c.env.DB.prepare(
    `
    INSERT INTO integrations (project_id, type, name, config, enabled)
    VALUES (?, ?, ?, ?, ?)
  `
  )
    .bind(projectId, 'jira', 'Jira', JSON.stringify(config), 1)
    .run();
}

/** Get Jira integration config for project */
export async function getJiraIntegration(
  c: Context<{ Bindings: Env }>,
  projectId: string
): Promise<JiraIntegrationConfig | null> {
  const result = await c.env.DB.prepare(
    'SELECT * FROM integrations WHERE project_id = ? AND type = ?'
  )
    .bind(projectId, 'jira')
    .first();

  if (!result) return null;

  const config = JSON.parse((result as any).config);
  return {
    project_id: projectId,
    instance_url: config.instance_url,
    client_id: config.client_id,
    client_secret: config.client_secret,
    access_token: config.access_token,
    refresh_token: config.refresh_token,
    enabled: (result as any).enabled === 1,
    project_key: config.project_key,
    issue_type: config.issue_type,
    auto_create_on_failure: config.auto_create_on_failure ?? false,
  };
}

/** Build a JiraConfig from integration config */
export function buildJiraConfig(
  integration: JiraIntegrationConfig,
  publicBaseUrl: string
): JiraConfig {
  return {
    clientId: integration.client_id,
    clientSecret: integration.client_secret,
    instanceUrl: integration.instance_url,
    redirectUri: `${publicBaseUrl}/integrations/jira/callback`,
    scopes: ['read:jira-work', 'write:jira-work'],
  };
}

// Re-export sync operations
export { createIssueFromRun, updateJiraIssueStatus, handleJiraCallback } from './jira-service-sync';

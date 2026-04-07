// Jira sync operations: issue creation from runs, status updates, OAuth callback

import { Context } from 'hono';
import type { Env } from '../env.d';
import {
  createJiraIssue,
  addJiraComment,
  updateIssueStatus,
  exchangeCodeForToken,
  formatRunAsJiraDescription,
  mapRunStatusToTransition,
  type JiraIssueFields,
} from './jira-client';
import { getJiraIntegration, buildJiraConfig } from './jira-service';

/** Create Jira issue from failed run */
export async function createIssueFromRun(
  c: Context<{ Bindings: Env }>,
  runId: string
): Promise<{ issueKey: string; issueUrl: string } | null> {
  const run = await c.env.DB.prepare(
    `
    SELECT r.id, r.status, r.error, r.duration, r.created_at, r.project_id,
      f.name as flow_name, f.id as flow_id, p.url as project_url
    FROM runs r JOIN flows f ON f.id = r.flow_id
    JOIN projects p ON p.id = f.project_id WHERE r.id = ?
  `
  )
    .bind(runId)
    .first();

  if (!run) {
    console.error('Run not found:', runId);
    return null;
  }

  const integration = await getJiraIntegration(c, (run as any).project_id);
  if (!integration?.enabled || !integration.auto_create_on_failure) return null;
  if ((run as any).status !== 'failed') return null;

  const artifacts = await c.env.DB.prepare(
    'SELECT kind, url, content_type FROM artifacts WHERE run_id = ?'
  )
    .bind(runId)
    .all();

  const jiraConfig = buildJiraConfig(integration, c.env.PUBLIC_BASE_URL);

  try {
    const fields: JiraIssueFields = {
      project: { key: integration.project_key },
      summary: `[CodeRail] ${integration.project_key.toUpperCase()}: ${run.flow_name} Failed`,
      description: formatRunAsJiraDescription({
        flowName: (run as any).flow_name,
        flowId: (run as any).flow_id,
        runId,
        status: (run as any).status,
        duration: (run as any).duration,
        error: (run as any).error,
        artifacts: artifacts.results as { kind: string; url?: string; content_type?: string }[],
        projectUrl: (run as any).project_url,
      }),
      ...(integration.issue_type && { issuetype: { name: integration.issue_type } }),
      labels: ['coderail', 'automated-test', 'bug-report'],
      attachments: artifacts.results
        .filter((a: any) => a.kind === 'video' || a.content_type?.includes('video'))
        .map((a: any) => ({
          filename: `${a.kind}-${runId}.${a.content_type?.split('/')[1] || 'mp4'}`,
          content: a.url,
          contentType: a.content_type || 'video/mp4',
        })),
    };

    const issue = await createJiraIssue(jiraConfig, integration.access_token!, fields);

    await c.env.DB.prepare('UPDATE runs SET jira_issue_key = ? WHERE id = ?')
      .bind(issue.key, runId)
      .run();

    const runUrl = `${(run as any).project_url}/runs/${runId}`;
    await addJiraComment(
      jiraConfig,
      integration.access_token!,
      issue.key,
      `View full execution details in CodeRail: ${runUrl}`
    );

    return {
      issueKey: issue.key,
      issueUrl: `${jiraConfig.instanceUrl}/browse/${issue.key}`,
    };
  } catch (error) {
    console.error('Failed to create Jira issue:', error);
    return null;
  }
}

/** Update Jira issue status based on run status */
export async function updateJiraIssueStatus(
  c: Context<{ Bindings: Env }>,
  runId: string
): Promise<void> {
  const run = await c.env.DB.prepare(
    'SELECT id, status, jira_issue_key, project_id FROM runs WHERE id = ? AND jira_issue_key IS NOT NULL'
  )
    .bind(runId)
    .first();

  if (!run) return;

  const integration = await getJiraIntegration(c, (run as any).project_id);
  if (!integration?.enabled) return;

  const transition = mapRunStatusToTransition((run as any).status);
  if (!transition) return;

  const jiraConfig = buildJiraConfig(integration, c.env.PUBLIC_BASE_URL);

  try {
    await updateIssueStatus(
      jiraConfig,
      integration.access_token!,
      (run as any).jira_issue_key,
      transition
    );
  } catch (error) {
    console.error('Failed to update Jira issue status:', error);
  }
}

/** Handle Jira OAuth callback */
export async function handleJiraCallback(
  c: Context<{ Bindings: Env }>,
  code: string,
  state: string
): Promise<{ access_token: string; refresh_token: string }> {
  const stateData = JSON.parse(atob(state));
  const projectId = stateData.project_id;

  const integration = await getJiraIntegration(c, projectId);
  if (!integration) throw new Error('Jira integration not found');

  const jiraConfig = buildJiraConfig(integration, c.env.PUBLIC_BASE_URL);
  const tokens = await exchangeCodeForToken(jiraConfig, code);

  await c.env.DB.prepare(
    `
    UPDATE integrations
    SET config = json_set(config, '$.access_token', ?),
              config = json_set(config, '$.refresh_token', ?)
    WHERE project_id = ? AND type = ?
  `
  )
    .bind(tokens.access_token, tokens.refresh_token, projectId, 'jira')
    .run();

  return { access_token: tokens.access_token, refresh_token: tokens.refresh_token };
}

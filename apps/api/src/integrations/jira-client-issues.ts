// Jira issue creation, status transitions, and formatting utilities

import type { JiraConfig, JiraIssueFields, JiraIssue } from './jira-client';
import { attachFileToIssue } from './jira-client';

/** Create Jira issue with attachments */
export async function createJiraIssue(
  config: JiraConfig,
  accessToken: string,
  fields: JiraIssueFields
): Promise<JiraIssue> {
  const issueData = {
    fields: {
      project: { key: fields.project.key },
      summary: fields.summary,
      description: fields.description || '',
      ...(fields.issuetype && { issuetype: { name: fields.issuetype.name } }),
      ...(fields.priority && { priority: { name: fields.priority.name } }),
      ...(fields.labels && { labels: fields.labels }),
    },
  };

  const response = await fetch(`${config.instanceUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(issueData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Jira issue: ${error}`);
  }

  const issue: JiraIssue = await response.json();

  if (fields.attachments && fields.attachments.length > 0) {
    for (const attachment of fields.attachments) {
      try {
        await attachFileToIssue(
          config,
          accessToken,
          issue.key,
          attachment.filename,
          attachment.content,
          attachment.contentType
        );
      } catch (error) {
        console.error(`Failed to attach ${attachment.filename}:`, error);
      }
    }
  }

  return issue;
}

/** Update Jira issue status via workflow transition */
export async function updateIssueStatus(
  config: JiraConfig,
  accessToken: string,
  issueKey: string,
  transitionName: string
): Promise<void> {
  const transitionsResponse = await fetch(
    `${config.instanceUrl}/rest/api/3/issue/${issueKey}/transitions`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (!transitionsResponse.ok) {
    throw new Error('Failed to get issue transitions');
  }

  const transitionsData = (await transitionsResponse.json()) as {
    transitions: Array<{ id: string; name: string }>;
  };
  const transition = transitionsData.transitions.find(
    (t: any) => t.name.toLowerCase() === transitionName.toLowerCase()
  );

  if (!transition) {
    throw new Error(`Transition "${transitionName}" not found`);
  }

  const response = await fetch(`${config.instanceUrl}/rest/api/3/issue/${issueKey}/transitions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transition: { id: transition.id } }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update issue status: ${error}`);
  }
}

/** Format run data as Jira issue description */
export function formatRunAsJiraDescription(runData: {
  flowName: string;
  flowId: string;
  runId: string;
  status: string;
  duration: number;
  error?: string;
  artifacts?: Array<{ kind: string; url?: string; content_type?: string }>;
  projectUrl?: string;
}): string {
  const lines: string[] = [];
  lines.push('h2. Flow Execution Details');
  lines.push('');
  lines.push('*Flow:* ' + runData.flowName);
  lines.push('*Flow ID:* ' + runData.flowId);
  lines.push('*Status:* ' + runData.status);
  lines.push('*Duration:* ' + (runData.duration / 1000).toFixed(1) + 's');

  if (runData.projectUrl) {
    lines.push('*Project:* ' + runData.projectUrl);
  }

  if (runData.error) {
    lines.push('');
    lines.push('h3. Error Details');
    lines.push('');
    lines.push('*Error:* ' + runData.error);
  }

  if (runData.artifacts && runData.artifacts.length > 0) {
    lines.push('');
    lines.push('h3. Artifacts');
    lines.push('');
    runData.artifacts.forEach((artifact) => {
      if (artifact.kind === 'video' || artifact.content_type?.includes('video')) {
        lines.push('* Video:* [View|' + artifact.url + ']');
      } else if (
        artifact.kind?.includes('screenshot') ||
        artifact.content_type?.includes('image')
      ) {
        lines.push('* Screenshot:* [View|' + artifact.url + ']');
      } else if (artifact.kind === 'subtitle') {
        lines.push('* Subtitles:* [Download|' + artifact.url + ']');
      } else if (artifact.kind === 'report') {
        lines.push('* Report:* [Download|' + artifact.url + ']');
      }
    });
  }

  lines.push('');
  lines.push('---');
  lines.push('*Run ID:* ' + runData.runId);
  lines.push('*View in CodeRail:* ' + (runData.projectUrl || 'N/A'));
  return lines.join('\n');
}

/** Map run status to Jira transition */
export function mapRunStatusToTransition(runStatus: string): string | null {
  switch (runStatus.toLowerCase()) {
    case 'running':
      return 'In Progress';
    case 'succeeded':
      return 'Done';
    case 'failed':
      return 'To Do';
    default:
      return null;
  }
}

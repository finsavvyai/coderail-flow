import { MessageSquare, Webhook, GitBranch, Github, Globe } from 'lucide-react';
import { getApiToken } from './api-core';

export const API_BASE = import.meta.env.VITE_API_URL || '';

export interface Integration {
  id: string;
  project_id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  enabled: number;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  key?: string;
  scopes: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Delivery {
  id: string;
  event: string;
  status_code: number;
  success: number;
  attempted_at: string;
  response_body?: string;
}

export interface ConfigField {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
}

export const INTEGRATION_TYPES = [
  {
    value: 'slack',
    label: 'Slack',
    icon: MessageSquare,
    color: '#e01e5a',
    description: 'Send notifications to Slack channels',
  },
  {
    value: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    color: '#8b5cf6',
    description: 'Send HTTP POST to any URL',
  },
  {
    value: 'gitlab',
    label: 'GitLab',
    icon: GitBranch,
    color: '#fc6d26',
    description: 'Trigger flows from GitLab CI/CD',
  },
  {
    value: 'github',
    label: 'GitHub',
    icon: Github,
    color: '#ffffff',
    description: 'Trigger flows from GitHub Actions',
  },
  {
    value: 'jira',
    label: 'Jira',
    icon: Globe,
    color: '#2684ff',
    description: 'Create Jira issues for failed runs',
  },
];

export async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getApiToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res.json() as Promise<any>;
}

export function getConfigFields(type: string): ConfigField[] {
  switch (type) {
    case 'slack':
      return [
        {
          key: 'webhook_url',
          label: 'Webhook URL',
          placeholder: 'https://hooks.slack.com/services/...',
        },
        { key: 'channel', label: 'Channel (optional)', placeholder: '#engineering' },
      ];
    case 'webhook':
      return [
        { key: 'url', label: 'Webhook URL', placeholder: 'https://your-api.com/webhook' },
        { key: 'secret', label: 'Secret (optional)', placeholder: 'hmac-secret-key', secret: true },
        { key: 'retry_attempts', label: 'Retry Attempts', placeholder: '3' },
        { key: 'retry_delay_ms', label: 'Retry Delay (ms)', placeholder: '1000' },
      ];
    case 'gitlab':
      return [
        {
          key: 'webhook_url',
          label: 'Notification URL (optional)',
          placeholder: 'https://gitlab.com/api/...',
        },
        {
          key: 'secret_token',
          label: 'Secret Token',
          placeholder: 'Token for incoming webhooks',
          secret: true,
        },
        {
          key: 'trigger_flow_id',
          label: 'Trigger Flow ID',
          placeholder: 'Flow to run on GitLab events',
        },
      ];
    case 'github':
      return [
        {
          key: 'webhook_url',
          label: 'Notification URL (optional)',
          placeholder: 'https://api.github.com/...',
        },
        { key: 'token', label: 'GitHub Token (optional)', placeholder: 'ghp_...', secret: true },
        { key: 'repo', label: 'Repository', placeholder: 'owner/repo' },
        {
          key: 'create_issue_on_failure',
          label: 'Create issue on failure (true/false)',
          placeholder: 'true',
        },
        {
          key: 'trigger_flow_id',
          label: 'Trigger Flow ID',
          placeholder: 'Flow to run on GitHub events',
        },
      ];
    case 'jira':
      return [
        { key: 'base_url', label: 'Jira Base URL', placeholder: 'https://your-org.atlassian.net' },
        { key: 'email', label: 'Jira Email', placeholder: 'you@company.com' },
        { key: 'api_token', label: 'Jira API Token', placeholder: 'ATATT...', secret: true },
        { key: 'project_key', label: 'Project Key', placeholder: 'ENG' },
        { key: 'issue_type', label: 'Issue Type (optional)', placeholder: 'Task' },
        {
          key: 'webhook_url',
          label: 'Fallback Webhook URL (optional)',
          placeholder: 'https://example.com/webhook',
        },
      ];
    default:
      return [];
  }
}

export function getTypeInfo(type: string) {
  return INTEGRATION_TYPES.find((t) => t.value === type);
}

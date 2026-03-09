export interface JiraConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  projectKey: string;
  issueType?: string;
  autoCreateOnFailure: boolean;
}

export interface JiraIntegrationProps {
  projectId: string;
  onClose?: () => void;
}

export const DEFAULT_JIRA_CONFIG: JiraConfig = {
  instanceUrl: '',
  clientId: '',
  clientSecret: '',
  projectKey: '',
  issueType: 'Bug',
  autoCreateOnFailure: false,
};

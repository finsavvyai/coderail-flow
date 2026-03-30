import { ExternalLink } from 'lucide-react';
import { apiAbsoluteUrl } from './api-core';

interface JiraOAuthSetupGuideProps {
  instanceUrl: string;
}

export function JiraOAuthSetupGuide({ instanceUrl }: JiraOAuthSetupGuideProps) {
  const baseUrl = instanceUrl || 'https://your-domain.atlassian.net';
  const oauthUrl = `${baseUrl}/plugins/servlet/oauth/com.atlassian.oauth.oauth2consumer:client-id-plugin`;
  const callbackUrl = apiAbsoluteUrl('/integrations/jira/callback');

  return (
    <div className="jira-oauth-box">
      <div className="jira-oauth-header">
        <ExternalLink size={16} className="jira-oauth-icon" />
        <span className="jira-oauth-title">OAuth 2.0 Setup Required</span>
      </div>
      <ol className="jira-oauth-steps">
        <li>
          Go to{' '}
          <a href={oauthUrl} target="_blank" rel="noopener noreferrer" className="jira-oauth-link">
            Jira OAuth 2.0 settings
          </a>
        </li>
        <li>
          Create a new OAuth 2.0 client with redirect URL:{' '}
          <code className="jira-oauth-code">{callbackUrl}</code>
        </li>
        <li>Copy the Client ID and Secret to this form</li>
      </ol>
    </div>
  );
}

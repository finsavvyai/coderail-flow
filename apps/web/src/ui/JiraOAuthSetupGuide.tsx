import { ExternalLink } from 'lucide-react';

interface JiraOAuthSetupGuideProps {
  instanceUrl: string;
}

export function JiraOAuthSetupGuide({ instanceUrl }: JiraOAuthSetupGuideProps) {
  const baseUrl = instanceUrl || 'https://your-domain.atlassian.net';
  const oauthUrl = `${baseUrl}/plugins/servlet/oauth/com.atlassian.oauth.oauth2consumer:client-id-plugin`;
  const callbackUrl = `${window.location.origin}/api/integrations/jira/callback`;

  return (
    <div
      style={{
        padding: 16,
        background: '#0a1628',
        borderRadius: 8,
        border: '1px solid #0052CC',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <ExternalLink size={16} style={{ color: '#0052CC' }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: '#0052CC' }}>
          OAuth 2.0 Setup Required
        </span>
      </div>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#a3a3a3', lineHeight: 1.6 }}>
        <li style={{ marginBottom: 6 }}>
          Go to{' '}
          <a href={oauthUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0052CC' }}>
            Jira OAuth 2.0 settings
          </a>
        </li>
        <li style={{ marginBottom: 6 }}>
          Create a new OAuth 2.0 client with redirect URL:{' '}
          <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: 3 }}>
            {callbackUrl}
          </code>
        </li>
        <li>Copy the Client ID and Secret to this form</li>
      </ol>
    </div>
  );
}

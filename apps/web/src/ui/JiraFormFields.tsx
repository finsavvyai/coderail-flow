import { useState } from 'react';
import type { JiraConfig } from './JiraIntegrationForm.types';

interface JiraFormFieldsProps {
  config: JiraConfig;
  existingConfig: any;
  onChange: (config: JiraConfig) => void;
}

const labelStyle = { display: 'block' as const, marginBottom: 6, fontSize: 13, fontWeight: 500 };
const hintStyle = { fontSize: 11, color: '#666', marginTop: 4 };

export function JiraInstanceUrlField({ config, onChange }: JiraFormFieldsProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor="jira-instance-url" style={labelStyle}>Jira Instance URL</label>
      <input
        id="jira-instance-url"
        className="input"
        type="url"
        placeholder="https://your-domain.atlassian.net"
        value={config.instanceUrl}
        onChange={(e) => onChange({ ...config, instanceUrl: e.target.value })}
        required
      />
      <div style={hintStyle}>
        Your Jira Cloud instance URL (e.g., https://company.atlassian.net)
      </div>
    </div>
  );
}

export function JiraCredentialsFields({ config, existingConfig, onChange }: JiraFormFieldsProps) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      <div>
        <label htmlFor="jira-client-id" style={labelStyle}>Client ID</label>
        <input
          id="jira-client-id"
          className="input"
          type="text"
          placeholder="OAuth 2.0 Client ID"
          value={config.clientId}
          onChange={(e) => onChange({ ...config, clientId: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="jira-client-secret" style={labelStyle}>Client Secret</label>
        <div style={{ position: 'relative' }}>
          <input
            id="jira-client-secret"
            className="input"
            type={showSecret ? 'text' : 'password'}
            placeholder="OAuth 2.0 Client Secret"
            value={config.clientSecret}
            onChange={(e) => onChange({ ...config, clientSecret: e.target.value })}
            required={!existingConfig}
            style={{ paddingRight: 80 }}
          />
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            {showSecret ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function JiraProjectFields({ config, onChange }: JiraFormFieldsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      <div>
        <label htmlFor="jira-project-key" style={labelStyle}>Project Key</label>
        <input
          id="jira-project-key"
          className="input"
          type="text"
          placeholder="PROJ"
          value={config.projectKey}
          onChange={(e) => onChange({ ...config, projectKey: e.target.value.toUpperCase() })}
          required
        />
        <div style={hintStyle}>Jira project key (e.g., PROJ)</div>
      </div>
      <div>
        <label htmlFor="jira-issue-type" style={labelStyle}>Default Issue Type</label>
        <input
          id="jira-issue-type"
          className="input"
          type="text"
          placeholder="Bug"
          value={config.issueType}
          onChange={(e) => onChange({ ...config, issueType: e.target.value })}
        />
        <div style={hintStyle}>Issue type for created issues</div>
      </div>
    </div>
  );
}

export function JiraAutoCreateToggle({ config, onChange }: JiraFormFieldsProps) {
  return (
    <div
      style={{
        padding: 12,
        background: '#1a1a1a',
        borderRadius: 8,
        border: '1px solid #2a2a2a',
        marginBottom: 16,
      }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={config.autoCreateOnFailure}
          onChange={(e) => onChange({ ...config, autoCreateOnFailure: e.target.checked })}
          style={{ width: 16, height: 16 }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Auto-create issues on failure</div>
          <div style={{ fontSize: 11, color: '#888' }}>
            Automatically create Jira issues when flows fail
          </div>
        </div>
      </label>
    </div>
  );
}

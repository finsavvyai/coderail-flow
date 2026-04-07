import { useState } from 'react';
import type { JiraConfig } from './JiraIntegrationForm.types';

interface JiraFormFieldsProps {
  config: JiraConfig;
  existingConfig: any;
  onChange: (config: JiraConfig) => void;
}

export function JiraInstanceUrlField({ config, onChange }: JiraFormFieldsProps) {
  return (
    <div className="jira-field-group">
      <label htmlFor="jira-instance-url" className="jira-label">
        Jira Instance URL
      </label>
      <input
        id="jira-instance-url"
        className="input"
        type="url"
        placeholder="https://your-domain.atlassian.net"
        value={config.instanceUrl}
        onChange={(e) => onChange({ ...config, instanceUrl: e.target.value })}
        required
      />
      <div className="jira-hint">
        Your Jira Cloud instance URL (e.g., https://company.atlassian.net)
      </div>
    </div>
  );
}

export function JiraCredentialsFields({ config, existingConfig, onChange }: JiraFormFieldsProps) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="jira-grid-2col">
      <div>
        <label htmlFor="jira-client-id" className="jira-label">
          Client ID
        </label>
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
        <label htmlFor="jira-client-secret" className="jira-label">
          Client Secret
        </label>
        <div className="jira-secret-wrapper">
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
            className="jira-show-toggle"
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
    <div className="jira-grid-2col">
      <div>
        <label htmlFor="jira-project-key" className="jira-label">
          Project Key
        </label>
        <input
          id="jira-project-key"
          className="input"
          type="text"
          placeholder="PROJ"
          value={config.projectKey}
          onChange={(e) => onChange({ ...config, projectKey: e.target.value.toUpperCase() })}
          required
        />
        <div className="jira-hint">Jira project key (e.g., PROJ)</div>
      </div>
      <div>
        <label htmlFor="jira-issue-type" className="jira-label">
          Default Issue Type
        </label>
        <input
          id="jira-issue-type"
          className="input"
          type="text"
          placeholder="Bug"
          value={config.issueType}
          onChange={(e) => onChange({ ...config, issueType: e.target.value })}
        />
        <div className="jira-hint">Issue type for created issues</div>
      </div>
    </div>
  );
}

export function JiraAutoCreateToggle({ config, onChange }: JiraFormFieldsProps) {
  return (
    <div className="jira-auto-toggle">
      <label className="jira-auto-label">
        <input
          type="checkbox"
          checked={config.autoCreateOnFailure}
          onChange={(e) => onChange({ ...config, autoCreateOnFailure: e.target.checked })}
          style={{ width: 16, height: 16 }}
        />
        <div>
          <div className="jira-auto-title">Auto-create issues on failure</div>
          <div className="jira-auto-desc">Automatically create Jira issues when flows fail</div>
        </div>
      </label>
    </div>
  );
}

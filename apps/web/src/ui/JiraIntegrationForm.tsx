import { Trash2 } from 'lucide-react';
import type { JiraIntegrationProps } from './JiraIntegrationForm.types';
import { useJiraConfig } from './useJiraConfig';
import {
  JiraInstanceUrlField,
  JiraCredentialsFields,
  JiraProjectFields,
  JiraAutoCreateToggle,
} from './JiraFormFields';
import { JiraOAuthSetupGuide } from './JiraOAuthSetupGuide';

function JiraHeader() {
  return (
    <div className="jira-header">
      <div className="jira-header-row">
        <div className="jira-header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Jira Integration</h2>
          <div className="jira-header-subtitle">
            Automatically create Jira issues from failed runs
          </div>
        </div>
      </div>
    </div>
  );
}

export function JiraIntegrationForm({ projectId, onClose }: JiraIntegrationProps) {
  const {
    config,
    setConfig,
    loading,
    testing,
    existingConfig,
    saveConfig,
    testConnection,
    deleteIntegration,
  } = useJiraConfig(projectId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void saveConfig();
  }

  const testDisabled = testing || !config.instanceUrl || !config.clientId;

  return (
    <div className="card jira-form-card">
      <JiraHeader />
      <form onSubmit={handleSubmit}>
        <JiraInstanceUrlField
          config={config}
          existingConfig={existingConfig}
          onChange={setConfig}
        />
        <JiraCredentialsFields
          config={config}
          existingConfig={existingConfig}
          onChange={setConfig}
        />
        <JiraProjectFields config={config} existingConfig={existingConfig} onChange={setConfig} />
        <JiraAutoCreateToggle
          config={config}
          existingConfig={existingConfig}
          onChange={setConfig}
        />
        <JiraOAuthSetupGuide instanceUrl={config.instanceUrl} />

        <div className="jira-form-actions">
          {existingConfig && (
            <button type="button" onClick={deleteIntegration} className="jira-delete-btn">
              <Trash2 size={14} style={{ display: 'inline', marginRight: 6 }} />
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={testConnection}
            disabled={testDisabled}
            className="btn jira-test-btn"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`btn jira-submit-btn${loading ? ' jira-submit-btn--loading' : ''}`}
          >
            {loading ? 'Saving...' : existingConfig ? 'Update Integration' : 'Create Integration'}
          </button>
        </div>

        {onClose && (
          <button type="button" onClick={onClose} className="btn jira-close-btn">
            Close
          </button>
        )}
      </form>
    </div>
  );
}

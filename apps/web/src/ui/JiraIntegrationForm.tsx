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
    <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #2a2a2a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: '#0052CC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Jira Integration</h2>
          <div style={{ fontSize: 13, color: '#a3a3a3' }}>
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
    <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
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

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {existingConfig && (
            <button
              type="button"
              onClick={deleteIntegration}
              style={{
                padding: '8px 16px',
                background: '#dc2626',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} style={{ display: 'inline', marginRight: 6 }} />
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={testConnection}
            disabled={testDisabled}
            className="btn"
            style={{
              padding: '8px 16px',
              background: '#2a2a2a',
              border: '1px solid #3b82f6',
              fontSize: 13,
            }}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              background: loading ? '#2a2a2a' : '#0052CC',
            }}
          >
            {loading ? 'Saving...' : existingConfig ? 'Update Integration' : 'Create Integration'}
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ marginTop: 12, width: '100%', background: '#2a2a2a' }}
          >
            Close
          </button>
        )}
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, ExternalLink, Trash2, Plus, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface JiraConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  projectKey: string;
  issueType?: string;
  autoCreateOnFailure: boolean;
}

interface JiraIntegrationProps {
  projectId: string;
  onClose?: () => void;
}

export function JiraIntegrationForm({ projectId, onClose }: JiraIntegrationProps) {
  const [config, setConfig] = useState<JiraConfig>({
    instanceUrl: '',
    clientId: '',
    clientSecret: '',
    projectKey: '',
    issueType: 'Bug',
    autoCreateOnFailure: false,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [existingConfig, setExistingConfig] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, [projectId]);

  async function loadExistingConfig() {
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch(
        `/api/integrations/jira/config?projectId=${encodeURIComponent(projectId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setExistingConfig(data.config);
          setConfig({
            instanceUrl: data.config.instance_url || '',
            clientId: data.config.client_id || '',
            clientSecret: '', // Never load existing secret
            projectKey: data.config.project_key || '',
            issueType: data.config.issue_type || 'Bug',
            autoCreateOnFailure: data.config.auto_create_on_failure || false,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load Jira config:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch('/api/integrations/jira/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          config: {
            instance_url: config.instanceUrl,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            project_key: config.projectKey,
            issue_type: config.issueType,
            auto_create_on_failure: config.autoCreateOnFailure,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save Jira configuration');
      }

      toast.success('Jira integration saved successfully!');
      await loadExistingConfig();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save Jira configuration');
    } finally {
      setLoading(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch('/api/integrations/jira/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instanceUrl: config.instanceUrl,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Connection test failed');
      }

      toast.success('Jira connection successful!');
    } catch (error: any) {
      toast.error(error.message || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  }

  async function deleteIntegration() {
    if (!confirm('Are you sure you want to remove the Jira integration?')) return;

    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch('/api/integrations/jira/config', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        throw new Error('Failed to remove integration');
      }

      toast.success('Jira integration removed');
      setExistingConfig(null);
      setConfig({
        instanceUrl: '',
        clientId: '',
        clientSecret: '',
        projectKey: '',
        issueType: 'Bug',
        autoCreateOnFailure: false,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove integration');
    }
  }

  return (
    <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
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
            <div style={{ fontSize: 13, color: '#888' }}>
              Automatically create Jira issues from failed runs
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Instance URL */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
            Jira Instance URL
          </label>
          <input
            className="input"
            type="url"
            placeholder="https://your-domain.atlassian.net"
            value={config.instanceUrl}
            onChange={(e) => setConfig({ ...config, instanceUrl: e.target.value })}
            required
          />
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            Your Jira Cloud instance URL (e.g., https://company.atlassian.net)
          </div>
        </div>

        {/* OAuth Credentials */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Client ID
            </label>
            <input
              className="input"
              type="text"
              placeholder="OAuth 2.0 Client ID"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Client Secret
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showSecret ? 'text' : 'password'}
                placeholder="OAuth 2.0 Client Secret"
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
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

        {/* Project Settings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Project Key
            </label>
            <input
              className="input"
              type="text"
              placeholder="PROJ"
              value={config.projectKey}
              onChange={(e) => setConfig({ ...config, projectKey: e.target.value.toUpperCase() })}
              required
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              Jira project key (e.g., PROJ)
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Default Issue Type
            </label>
            <input
              className="input"
              type="text"
              placeholder="Bug"
              value={config.issueType}
              onChange={(e) => setConfig({ ...config, issueType: e.target.value })}
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              Issue type for created issues
            </div>
          </div>
        </div>

        {/* Auto-create toggle */}
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
              onChange={(e) => setConfig({ ...config, autoCreateOnFailure: e.target.checked })}
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

        {/* OAuth Setup Guide */}
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
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#888', lineHeight: 1.6 }}>
            <li style={{ marginBottom: 6 }}>
              Go to{' '}
              <a
                href={`${config.instanceUrl || 'https://your-domain.atlassian.net'}/plugins/servlet/oauth/com.atlassian.oauth.oauth2consumer:client-id-plugin`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0052CC' }}
              >
                Jira OAuth 2.0 settings
              </a>
            </li>
            <li style={{ marginBottom: 6 }}>
              Create a new OAuth 2.0 client with redirect URL:{' '}
              <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: 3 }}>
                {window.location.origin}/api/integrations/jira/callback
              </code>
            </li>
            <li>Copy the Client ID and Secret to this form</li>
          </ol>
        </div>

        {/* Actions */}
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
            disabled={testing || !config.instanceUrl || !config.clientId}
            style={{
              padding: '8px 16px',
              background: '#2a2a2a',
              border: '1px solid #3b82f6',
              borderRadius: 6,
              color: 'white',
              fontSize: 13,
              cursor: testing || !config.instanceUrl || !config.clientId ? 'not-allowed' : 'pointer',
              opacity: testing || !config.instanceUrl || !config.clientId ? 0.5 : 1,
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
              opacity: loading ? 0.6 : 1,
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

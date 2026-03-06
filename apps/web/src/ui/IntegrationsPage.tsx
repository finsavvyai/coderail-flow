import { useState } from 'react';
import { Plus, Webhook, Key } from 'lucide-react';
import { useIntegrations } from './useIntegrations';
import { AddIntegrationForm } from './AddIntegrationForm';
import { IntegrationList, WebhookUrls } from './IntegrationList';
import { ApiKeysTab } from './ApiKeysTab';
import { JiraIntegrationForm } from './JiraIntegrationForm';

export function IntegrationsPage({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<'integrations' | 'apikeys' | 'jira'>('integrations');
  const [showAdd, setShowAdd] = useState(false);

  const {
    integrations,
    apiKeys,
    loading,
    expandedDeliveries,
    deliveries,
    testing,
    createIntegration,
    toggleIntegration,
    deleteIntegration,
    testIntegration,
    loadDeliveries,
    createApiKey,
    deleteApiKey,
  } = useIntegrations(projectId);

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#666' }}>Loading integrations...</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #2a2a2a', paddingBottom: 8 }}>
        <button
          className="btn"
          onClick={() => setTab('integrations')}
          style={{
            background: tab === 'integrations' ? '#3b82f6' : '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Webhook size={14} /> Integrations
        </button>
        <button
          className="btn"
          onClick={() => setTab('jira')}
          style={{
            background: tab === 'jira' ? '#0052CC' : '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
          Jira
        </button>
        <button
          className="btn"
          onClick={() => setTab('apikeys')}
          style={{
            background: tab === 'apikeys' ? '#3b82f6' : '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Key size={14} /> API Keys
        </button>
      </div>

      {tab === 'integrations' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2" style={{ margin: 0 }}>
                Integrations
              </div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                Connect Slack, GitLab, GitHub, and custom webhooks
              </div>
            </div>
            <button
              className="btn"
              onClick={() => setShowAdd(!showAdd)}
              style={{ background: '#3b82f6' }}
            >
              <Plus size={14} /> Add Integration
            </button>
          </div>

          {showAdd && (
            <AddIntegrationForm
              onSubmit={async (type, name, config) => {
                const ok = await createIntegration(type, name, config);
                if (ok) setShowAdd(false);
                return ok;
              }}
              onCancel={() => setShowAdd(false)}
            />
          )}

          {(!showAdd || integrations.length > 0) && (
            <IntegrationList
              integrations={integrations}
              testing={testing}
              expandedDeliveries={expandedDeliveries}
              deliveries={deliveries}
              onTest={testIntegration}
              onToggle={toggleIntegration}
              onDelete={deleteIntegration}
              onLoadDeliveries={loadDeliveries}
            />
          )}

          <WebhookUrls />
        </>
      )}

      {tab === 'apikeys' && (
        <ApiKeysTab apiKeys={apiKeys} onCreateKey={createApiKey} onDeleteKey={deleteApiKey} />
      )}

      {tab === 'jira' && <JiraIntegrationForm projectId={projectId} />}
    </div>
  );
}

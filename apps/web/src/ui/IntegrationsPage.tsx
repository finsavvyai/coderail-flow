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
    return <div className="integ-loading">Loading integrations...</div>;
  }

  return (
    <div className="integ-page">
      <div className="integ-tabs">
        <button
          className={`btn integ-tab${tab === 'integrations' ? ' integ-tab--active' : ''}`}
          onClick={() => setTab('integrations')}
        >
          <Webhook size={14} /> Integrations
        </button>
        <button
          className={`btn integ-tab${tab === 'jira' ? ' integ-tab--jira-active' : ''}`}
          onClick={() => setTab('jira')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
          Jira
        </button>
        <button
          className={`btn integ-tab${tab === 'apikeys' ? ' integ-tab--active' : ''}`}
          onClick={() => setTab('apikeys')}
        >
          <Key size={14} /> API Keys
        </button>
      </div>

      {tab === 'integrations' && (
        <>
          <div className="integ-header">
            <div>
              <div className="h2" style={{ margin: 0 }}>
                Integrations
              </div>
              <div className="integ-header-subtitle">
                Connect Slack, GitLab, GitHub, and custom webhooks
              </div>
            </div>
            <button className="btn integ-add-btn" onClick={() => setShowAdd(!showAdd)}>
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

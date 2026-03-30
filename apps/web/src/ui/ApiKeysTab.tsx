import { useState } from 'react';
import { Plus, Trash2, Key } from 'lucide-react';
import { ApiKey, API_BASE } from './integrations-types';
import { NewKeyBanner, AddKeyForm, EmptyKeyState } from './ApiKeyForm';

interface ApiKeysTabProps {
  apiKeys: ApiKey[];
  onCreateKey: (name: string, expiryDays: number) => Promise<string | null>;
  onDeleteKey: (id: string) => void;
}

export function ApiKeysTab({ apiKeys, onCreateKey, onDeleteKey }: ApiKeysTabProps) {
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [keyExpiry, setKeyExpiry] = useState('90');

  async function handleCreate() {
    const key = await onCreateKey(keyName, parseInt(keyExpiry) || 90);
    if (key) {
      setNewKey(key);
      setKeyName('');
    }
  }

  return (
    <>
      <div className="api-key-header">
        <div>
          <div className="h2">API Keys</div>
          <div className="api-key-subtitle">
            Use API keys to trigger flows from CI/CD, CLI, or external services
          </div>
        </div>
        <button
          className="btn api-key-create-btn"
          onClick={() => {
            setShowAddKey(!showAddKey);
            setNewKey(null);
          }}
        >
          <Plus size={14} /> Create Key
        </button>
      </div>

      {newKey && <NewKeyBanner keyValue={newKey} />}

      {showAddKey && !newKey && (
        <AddKeyForm
          keyName={keyName}
          keyExpiry={keyExpiry}
          onNameChange={setKeyName}
          onExpiryChange={setKeyExpiry}
          onCreate={handleCreate}
          onCancel={() => setShowAddKey(false)}
        />
      )}

      {apiKeys.length === 0 && !showAddKey ? (
        <EmptyKeyState />
      ) : (
        <KeyList apiKeys={apiKeys} onDelete={onDeleteKey} />
      )}

      <UsageExamples />
    </>
  );
}

function KeyList({ apiKeys, onDelete }: { apiKeys: ApiKey[]; onDelete: (id: string) => void }) {
  return (
    <div className="api-key-list">
      {apiKeys.map((key) => (
        <div key={key.id} className="card api-key-card">
          <Key size={16} className="api-key-icon" />
          <div className="api-key-info">
            <div className="api-key-info-name">{key.name}</div>
            <div className="api-key-info-meta">
              <code>{key.key_prefix}...</code>
              {key.last_used_at &&
                ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
              {key.expires_at && ` · Expires ${new Date(key.expires_at).toLocaleDateString()}`}
            </div>
          </div>
          <button
            className="btn api-key-delete-btn"
            onClick={() => onDelete(key.id)}
            aria-label="Delete API key"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

function UsageExamples() {
  return (
    <div className="card api-key-usage-card">
      <div className="api-key-usage-title">Usage Examples</div>
      <div className="api-key-usage-label">
        Trigger a flow run via API:
      </div>
      <pre className="api-key-code-block">
        {`curl -X POST ${API_BASE}/triggers/run \\
  -H "Authorization: Bearer crf_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"flowId": "FLOW_ID", "params": {}}'`}
      </pre>
      <div className="api-key-usage-label spaced">
        GitLab CI example:
      </div>
      <pre className="api-key-code-block">
        {`# .gitlab-ci.yml
e2e_test:
  stage: test
  script:
    - |
      curl -X POST ${API_BASE}/triggers/run \\
        -H "Authorization: Bearer $CODERAIL_API_KEY" \\
        -H "Content-Type: application/json" \\
        -d '{"flowId": "'$FLOW_ID'"}'`}
      </pre>
    </div>
  );
}

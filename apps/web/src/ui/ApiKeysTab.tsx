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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="h2" style={{ margin: 0 }}>
            API Keys
          </div>
          <div style={{ fontSize: 13, color: '#a3a3a3', marginTop: 4 }}>
            Use API keys to trigger flows from CI/CD, CLI, or external services
          </div>
        </div>
        <button
          className="btn"
          onClick={() => {
            setShowAddKey(!showAddKey);
            setNewKey(null);
          }}
          style={{ background: '#3b82f6' }}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {apiKeys.map((key) => (
        <div
          key={key.id}
          className="card"
          style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <Key size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{key.name}</div>
            <div style={{ fontSize: 11, color: '#a3a3a3' }}>
              <code>{key.key_prefix}...</code>
              {key.last_used_at &&
                ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
              {key.expires_at && ` · Expires ${new Date(key.expires_at).toLocaleDateString()}`}
            </div>
          </div>
          <button
            className="btn"
            onClick={() => onDelete(key.id)}
            style={{
              padding: '10px 12px',
              fontSize: 11,
              background: '#2a1a1a',
              minHeight: 44,
              minWidth: 44,
            }}
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
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontWeight: 500, marginBottom: 12 }}>Usage Examples</div>
      <div style={{ fontSize: 12, color: '#a3a3a3', marginBottom: 8 }}>
        Trigger a flow run via API:
      </div>
      <pre
        style={{
          background: '#0a0a0a',
          padding: 12,
          borderRadius: 6,
          fontSize: 11,
          color: '#86efac',
          overflow: 'auto',
        }}
      >
        {`curl -X POST ${API_BASE}/triggers/run \\
  -H "Authorization: Bearer crf_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"flowId": "FLOW_ID", "params": {}}'`}
      </pre>
      <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 16, marginBottom: 8 }}>
        GitLab CI example:
      </div>
      <pre
        style={{
          background: '#0a0a0a',
          padding: 12,
          borderRadius: 6,
          fontSize: 11,
          color: '#86efac',
          overflow: 'auto',
        }}
      >
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

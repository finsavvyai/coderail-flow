import { Copy, Key } from 'lucide-react';

export function NewKeyBanner({ keyValue }: { keyValue: string }) {
  return (
    <div
      className="card"
      style={{ padding: 16, background: '#0a2a0a', border: '1px solid #22c55e' }}
    >
      <div style={{ fontWeight: 500, color: '#22c55e', marginBottom: 8 }}>
        API Key Created -- copy it now, it won't be shown again!
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <code
          style={{
            flex: 1,
            background: '#0a0a0a',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 13,
            color: '#86efac',
            wordBreak: 'break-all',
          }}
        >
          {keyValue}
        </code>
        <button
          className="btn"
          onClick={() => navigator.clipboard.writeText(keyValue)}
          style={{ background: '#22c55e', flexShrink: 0 }}
        >
          <Copy size={14} /> Copy
        </button>
      </div>
    </div>
  );
}

export function AddKeyForm({
  keyName,
  keyExpiry,
  onNameChange,
  onExpiryChange,
  onCreate,
  onCancel,
}: {
  keyName: string;
  keyExpiry: string;
  onNameChange: (v: string) => void;
  onExpiryChange: (v: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontWeight: 500, marginBottom: 12 }}>New API Key</div>
      <label htmlFor="api-key-name" className="sr-only">
        Key name
      </label>
      <input
        id="api-key-name"
        className="input"
        placeholder="Key name (e.g., 'GitLab CI')"
        value={keyName}
        onChange={(e) => onNameChange(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <label htmlFor="api-key-expiry" className="sr-only">
        Expiry
      </label>
      <select
        id="api-key-expiry"
        className="input"
        value={keyExpiry}
        onChange={(e) => onExpiryChange(e.target.value)}
        style={{ marginBottom: 12 }}
      >
        <option value="30">Expires in 30 days</option>
        <option value="90">Expires in 90 days</option>
        <option value="365">Expires in 1 year</option>
        <option value="">Never expires</option>
      </select>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" onClick={onCreate} style={{ background: '#22c55e' }}>
          <Key size={14} /> Generate Key
        </button>
        <button className="btn" onClick={onCancel} style={{ background: '#2a2a2a' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function EmptyKeyState() {
  return (
    <div className="card" style={{ padding: 48, textAlign: 'center', color: '#a3a3a3' }}>
      <Key
        size={48}
        strokeWidth={1}
        style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}
      />
      <div style={{ fontSize: 16, marginBottom: 8 }}>No API keys</div>
      <div style={{ fontSize: 13 }}>Create an API key to trigger flows from external services</div>
    </div>
  );
}

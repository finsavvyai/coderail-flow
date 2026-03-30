import { Copy, Key } from 'lucide-react';

export function NewKeyBanner({ keyValue }: { keyValue: string }) {
  return (
    <div className="card new-key-banner">
      <div className="new-key-title">
        API Key Created -- copy it now, it won't be shown again!
      </div>
      <div className="new-key-row">
        <code className="new-key-code">
          {keyValue}
        </code>
        <button
          className="btn new-key-copy-btn"
          onClick={() => navigator.clipboard.writeText(keyValue)}
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
    <div className="card add-key-form">
      <div className="add-key-form-title">New API Key</div>
      <label htmlFor="api-key-name" className="sr-only">
        Key name
      </label>
      <input
        id="api-key-name"
        className="input add-key-input"
        placeholder="Key name (e.g., 'GitLab CI')"
        value={keyName}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <label htmlFor="api-key-expiry" className="sr-only">
        Expiry
      </label>
      <select
        id="api-key-expiry"
        className="input add-key-select"
        value={keyExpiry}
        onChange={(e) => onExpiryChange(e.target.value)}
      >
        <option value="30">Expires in 30 days</option>
        <option value="90">Expires in 90 days</option>
        <option value="365">Expires in 1 year</option>
        <option value="">Never expires</option>
      </select>
      <div className="add-key-actions">
        <button className="btn add-key-generate-btn" onClick={onCreate}>
          <Key size={14} /> Generate Key
        </button>
        <button className="btn add-key-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function EmptyKeyState() {
  return (
    <div className="card empty-key-state">
      <Key
        size={48}
        strokeWidth={1}
        className="empty-key-icon"
      />
      <div className="empty-key-title">No API keys</div>
      <div className="empty-key-desc">Create an API key to trigger flows from external services</div>
    </div>
  );
}

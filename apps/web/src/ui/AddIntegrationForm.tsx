import { useState } from 'react';
import { Check } from 'lucide-react';
import { INTEGRATION_TYPES, getConfigFields } from './integrations-types';

interface AddIntegrationFormProps {
  onSubmit: (type: string, name: string, config: Record<string, string>) => Promise<boolean>;
  onCancel: () => void;
}

export function AddIntegrationForm({ onSubmit, onCancel }: AddIntegrationFormProps) {
  const [addType, setAddType] = useState('slack');
  const [addName, setAddName] = useState('');
  const [addConfig, setAddConfig] = useState<Record<string, string>>({});

  async function handleCreate() {
    const success = await onSubmit(addType, addName, addConfig);
    if (success) {
      setAddName('');
      setAddConfig({});
    }
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontWeight: 500, marginBottom: 16 }}>New Integration</div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {INTEGRATION_TYPES.map((t) => (
          <button
            key={t.value}
            className="btn"
            onClick={() => {
              setAddType(t.value);
              setAddConfig({});
            }}
            style={{
              background: addType === t.value ? 'rgba(59,130,246,0.15)' : '#1a1a1a',
              border: addType === t.value ? '1px solid #3b82f6' : '1px solid #2a2a2a',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <t.icon size={20} style={{ color: t.color }} />
            <span style={{ fontSize: 12 }}>{t.label}</span>
          </button>
        ))}
      </div>

      <input
        className="input"
        placeholder="Integration name (e.g., 'Engineering Slack')"
        value={addName}
        onChange={(e) => setAddName(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {getConfigFields(addType).map((field) => (
        <input
          key={field.key}
          className="input"
          type={field.secret ? 'password' : 'text'}
          placeholder={field.placeholder}
          value={addConfig[field.key] || ''}
          onChange={(e) => setAddConfig({ ...addConfig, [field.key]: e.target.value })}
          style={{ marginBottom: 8 }}
        />
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn" onClick={handleCreate} style={{ background: '#22c55e' }}>
          <Check size={14} /> Create
        </button>
        <button className="btn" onClick={onCancel} style={{ background: '#2a2a2a' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

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
    <div className="card add-form-card">
      <div className="add-form-title">New Integration</div>

      <div className="add-form-types">
        {INTEGRATION_TYPES.map((t) => (
          <button
            key={t.value}
            className={`btn add-form-type-btn${addType === t.value ? ' add-form-type-btn--selected' : ''}`}
            onClick={() => {
              setAddType(t.value);
              setAddConfig({});
            }}
          >
            <t.icon size={20} style={{ color: t.color }} />
            <span className="add-form-type-label">{t.label}</span>
          </button>
        ))}
      </div>

      <input
        className="input add-form-input-gap"
        placeholder="Integration name (e.g., 'Engineering Slack')"
        value={addName}
        onChange={(e) => setAddName(e.target.value)}
      />

      {getConfigFields(addType).map((field) => (
        <input
          key={field.key}
          className="input add-form-input-gap-sm"
          type={field.secret ? 'password' : 'text'}
          placeholder={field.placeholder}
          value={addConfig[field.key] || ''}
          onChange={(e) => setAddConfig({ ...addConfig, [field.key]: e.target.value })}
        />
      ))}

      <div className="add-form-actions">
        <button className="btn add-form-create-btn" onClick={handleCreate}>
          <Check size={14} /> Create
        </button>
        <button className="btn add-form-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { createFlowFromTemplate } from './api-flows';
import { getAuthProfiles } from './api-flows';
import type { TemplateSummary, AuthProfile } from './api-types';
import toast from 'react-hot-toast';

interface TemplateInstallModalProps {
  template: TemplateSummary;
  projectId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TemplateInstallModal({
  template,
  projectId,
  onClose,
  onSuccess,
}: TemplateInstallModalProps) {
  const [flowName, setFlowName] = useState(template.name);
  const [params, setParams] = useState<Record<string, any>>({});
  const [authProfileId, setAuthProfileId] = useState<string>('');
  const [authProfiles, setAuthProfiles] = useState<AuthProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [step, setStep] = useState<'details' | 'params'>('details');

  // Load auth profiles when modal opens
  const loadAuthProfiles = async () => {
    if (!projectId) return;
    setLoadingProfiles(true);
    try {
      const profiles = await getAuthProfiles(projectId);
      setAuthProfiles(profiles);
    } catch (error) {
      console.error('Failed to load auth profiles:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('Please select a project first');
      return;
    }

    setLoading(true);
    try {
      await createFlowFromTemplate({
        templateId: template.id,
        projectId,
        name: flowName,
        authProfileId: authProfileId || undefined,
        params,
      });
      toast.success(`Flow "${flowName}" created from template!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create flow from template');
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (name: string, value: any) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{template.name}</h2>
              <div style={{ fontSize: 13, color: '#888' }}>{template.category}</div>
            </div>
          </div>
          <p style={{ margin: 0, color: '#888', lineHeight: 1.5 }}>{template.description}</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {template.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '4px 10px',
                  background: '#2a2a2a',
                  borderRadius: 4,
                  fontSize: 11,
                  color: '#888',
                  textTransform: 'capitalize',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Flow Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Flow Name
            </label>
            <input
              className="input"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder={template.name}
              required
            />
          </div>

          {/* Auth Profile Selection */}
          {projectId && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                Authentication Profile (Optional)
              </label>
              <select
                className="input"
                value={authProfileId}
                onChange={(e) => setAuthProfileId(e.target.value)}
                onFocus={loadAuthProfiles}
                disabled={loadingProfiles}
              >
                <option value="">None</option>
                {authProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                Required for authenticated workflows
              </div>
            </div>
          )}

          {/* Template Parameters */}
          {template.params && template.params.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                Template Parameters
              </label>
              <div style={{ background: '#1a1a1a', padding: 12, borderRadius: 6 }}>
                {template.params.map((param) => (
                  <div key={param.name} style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 4,
                        fontSize: 12,
                        color: '#888',
                      }}
                    >
                      {param.name}
                      {param.required && <span style={{ color: '#dc3545' }}> *</span>}
                      <span style={{ marginLeft: 8, fontSize: 11, color: '#666' }}>
                        ({param.type})
                      </span>
                    </label>
                    {param.type === 'number' ? (
                      <input
                        className="input"
                        type="number"
                        value={params[param.name] || ''}
                        onChange={(e) => updateParam(param.name, Number(e.target.value))}
                        required={param.required}
                      />
                    ) : (
                      <input
                        className="input"
                        type="text"
                        value={params[param.name] || ''}
                        onChange={(e) => updateParam(param.name, e.target.value)}
                        placeholder={`Enter ${param.name}`}
                        required={param.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={onClose} style={{ background: '#2a2a2a' }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={loading || !projectId}
              style={{
                background: loading ? '#2a2a2a' : '#3b82f6',
                opacity: loading || !projectId ? 0.6 : 1,
              }}
            >
              {loading ? 'Creating…' : 'Create Flow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { createFlowFromTemplate, getAuthProfiles } from './api-flows';
import type { TemplateSummary, AuthProfile } from './api-types';
import toast from 'react-hot-toast';
import { TemplateParamForm } from './TemplateParamForm';

interface TemplateInstallModalProps {
  template: TemplateSummary;
  projectId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TemplateInstallModal({ template, projectId, onClose, onSuccess }: TemplateInstallModalProps) {
  const [flowName, setFlowName] = useState(template.name);
  const [params, setParams] = useState<Record<string, any>>({});
  const [authProfileId, setAuthProfileId] = useState('');
  const [authProfiles, setAuthProfiles] = useState<AuthProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

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
    if (!projectId) { toast.error('Please select a project first'); return; }
    setLoading(true);
    try {
      await createFlowFromTemplate({
        templateId: template.id, projectId, name: flowName,
        authProfileId: authProfileId || undefined, params,
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Install template"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 14, minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={20} />
        </button>
        <ModalHeader template={template} />
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="template-flow-name" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Flow Name</label>
            <input id="template-flow-name" className="input" value={flowName} onChange={(e) => setFlowName(e.target.value)} placeholder={template.name} required />
          </div>
          {projectId && (
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="template-auth-profile" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                Authentication Profile (Optional)
              </label>
              <select id="template-auth-profile" className="input" value={authProfileId} onChange={(e) => setAuthProfileId(e.target.value)} onFocus={loadAuthProfiles} disabled={loadingProfiles}>
                <option value="">None</option>
                {authProfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div style={{ fontSize: 11, color: '#a8b3cf', marginTop: 4 }}>Required for authenticated workflows</div>
            </div>
          )}
          {template.params && template.params.length > 0 && (
            <TemplateParamForm params={template.params} values={params} onUpdate={updateParam} />
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={onClose} style={{ background: '#2a2a2a' }}>Cancel</button>
            <button
              type="submit" className="btn" disabled={loading || !projectId}
              style={{ background: loading ? '#2a2a2a' : '#3b82f6', opacity: loading || !projectId ? 0.6 : 1, minWidth: 140 }}
            >
              {loading ? 'Creating...' : 'Create Flow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalHeader({ template }: { template: TemplateSummary }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #2a2a2a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{ width: 48, height: 48, borderRadius: 8, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <FileText size={24} style={{ color: 'white' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{template.name}</h2>
          <div style={{ fontSize: 13, color: '#a8b3cf' }}>{template.category}</div>
        </div>
      </div>
      <p style={{ margin: 0, color: '#a8b3cf', lineHeight: 1.5 }}>{template.description}</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        {template.tags.map((tag) => (
          <span key={tag} style={{ padding: '4px 10px', background: '#2a2a2a', borderRadius: 4, fontSize: 11, color: '#a8b3cf', textTransform: 'capitalize' }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

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

export function TemplateInstallModal({
  template,
  projectId,
  onClose,
  onSuccess,
}: TemplateInstallModalProps) {
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Install template"
      onClick={onClose}
    >
      <div
        className="card modal-card"
        style={{ maxWidth: 600 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>
        <ModalHeader template={template} />
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label htmlFor="template-flow-name" className="modal-form-label">
              Flow Name
            </label>
            <input
              id="template-flow-name"
              className="input"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder={template.name}
              required
            />
          </div>
          {projectId && (
            <div className="modal-form-group">
              <label htmlFor="template-auth-profile" className="modal-form-label">
                Authentication Profile (Optional)
              </label>
              <select
                id="template-auth-profile"
                className="input"
                value={authProfileId}
                onChange={(e) => setAuthProfileId(e.target.value)}
                onFocus={loadAuthProfiles}
                disabled={loadingProfiles}
              >
                <option value="">None</option>
                {authProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="modal-form-hint">Required for authenticated workflows</div>
            </div>
          )}
          {template.params && template.params.length > 0 && (
            <TemplateParamForm params={template.params} values={params} onUpdate={updateParam} />
          )}
          <div className="modal-footer-actions">
            <button type="button" className="btn modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn modal-btn-submit" disabled={loading || !projectId}>
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
    <div className="modal-header">
      <div className="modal-header-row">
        <div className="modal-header-icon">
          <FileText size={24} />
        </div>
        <div>
          <h2 className="modal-header-title">{template.name}</h2>
          <div className="modal-header-subtitle">{template.category}</div>
        </div>
      </div>
      <p className="modal-header-desc">{template.description}</p>
      <div className="modal-header-tags">
        {template.tags.map((tag) => (
          <span key={tag} className="template-tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

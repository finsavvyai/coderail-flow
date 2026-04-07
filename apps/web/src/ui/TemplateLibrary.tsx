import React from 'react';
import type { TemplateSummary } from './api';

interface TemplateLibraryProps {
  templates: TemplateSummary[];
  installingTemplateId: string;
  onInstall: (template: TemplateSummary) => void;
}

export function TemplateLibrary({
  templates,
  installingTemplateId,
  onInstall,
}: TemplateLibraryProps) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="h2" style={{ marginBottom: 12 }}>
        Template Library
      </div>
      {templates.length === 0 ? (
        <div className="small tpl-lib-empty">No templates available yet.</div>
      ) : (
        <div className="tpl-lib-grid">
          {templates.map((t) => (
            <div key={t.id} className="tpl-lib-card">
              <div className="tpl-lib-card-header">
                <div className="tpl-lib-card-name">{t.name}</div>
                <span className="badge">{t.category}</span>
              </div>
              <div className="small tpl-lib-card-desc">{t.description}</div>
              <div className="small tpl-lib-card-params">Params: {t.params?.length ?? 0}</div>
              <button
                className="btn tpl-lib-card-btn"
                disabled={installingTemplateId === t.id}
                onClick={() => onInstall(t)}
              >
                {installingTemplateId === t.id ? 'Installing...' : 'Install Template'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

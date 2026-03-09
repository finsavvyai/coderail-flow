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
        <div className="small" style={{ color: '#a8b3cf' }}>
          No templates available yet.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 10,
          }}
        >
          {templates.map((t) => (
            <div
              key={t.id}
              style={{
                background: '#161616',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                <span className="badge">{t.category}</span>
              </div>
              <div className="small" style={{ color: '#a8b3cf', minHeight: 36 }}>
                {t.description}
              </div>
              <div className="small" style={{ marginTop: 8, color: '#6f6f6f' }}>
                Params: {t.params?.length ?? 0}
              </div>
              <button
                className="btn"
                style={{ marginTop: 10, width: '100%' }}
                disabled={installingTemplateId === t.id}
                onClick={() => onInstall(t)}
              >
                {installingTemplateId === t.id ? 'Installing…' : 'Install Template'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { FileText, Copy, Check } from 'lucide-react';
import type { TemplateSummary } from './api-types';

interface TemplateCardProps {
  template: TemplateSummary;
  isCopied: boolean;
  onCopy: (t: TemplateSummary) => void;
  onSelect: (t: TemplateSummary) => void;
}

export function TemplateCard({ template, isCopied, onCopy, onSelect }: TemplateCardProps) {
  return (
    <div
      className="card"
      style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #2a2a2a' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} style={{ color: '#3b82f6' }} aria-hidden="true" />
          <span style={{ fontWeight: 500 }}>{template.name}</span>
        </div>
        <button
          className="btn"
          style={{ background: '#2a2a2a', padding: '8px 12px', minHeight: 44, minWidth: 44 }}
          aria-label={isCopied ? 'Copied' : 'Copy template details'}
          onClick={(e) => {
            e.stopPropagation();
            onCopy(template);
          }}
          title="Copy template details"
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p style={{ fontSize: 13, color: '#a8b3cf', marginBottom: 12 }}>{template.description}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {template.tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '2px 8px',
              background: '#2a2a2a',
              borderRadius: 4,
              fontSize: 11,
              color: '#a8b3cf',
              textTransform: 'capitalize',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#a8b3cf' }}>
          {template.params?.length ?? 0} params
        </span>
        <button
          className="btn"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={() => onSelect(template)}
        >
          Use Template
        </button>
      </div>
    </div>
  );
}

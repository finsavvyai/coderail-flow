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
    <div className="template-card">
      <div className="template-card-header">
        <div className="template-card-name-group">
          <FileText size={18} className="template-card-icon" aria-hidden="true" />
          <span className="template-card-name">{template.name}</span>
        </div>
        <button
          className="btn template-card-copy-btn"
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
      <p className="template-card-desc">{template.description}</p>
      <div className="template-card-tags">
        {template.tags.map((tag) => (
          <span key={tag} className="template-tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="template-card-footer">
        <span className="template-card-param-count">{template.params?.length ?? 0} params</span>
        <button className="btn template-card-use-btn" onClick={() => onSelect(template)}>
          Use Template
        </button>
      </div>
    </div>
  );
}

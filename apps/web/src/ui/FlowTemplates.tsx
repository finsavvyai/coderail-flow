import { useState, useEffect } from 'react';
import { FileText, Copy, Check, Search, Sparkles } from 'lucide-react';
import { getTemplates } from './api-flows';
import type { TemplateSummary } from './api-types';
import { TemplateInstallModal } from './TemplateInstallModal';

interface FlowTemplatesProps {
  projectId: string | null;
  onSuccess?: () => void;
}

export function FlowTemplates({ projectId, onSuccess }: FlowTemplatesProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummary | null>(null);

  // Load templates from API
  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleCopy(template: TemplateSummary) {
    navigator.clipboard.writeText(JSON.stringify(template, null, 2));
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleInstall(template: TemplateSummary) {
    if (!projectId) {
      alert('Please select a project first');
      return;
    }
    setSelectedTemplate(template);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Sparkles size={18} style={{ color: '#3b82f6' }} />
        <h2 style={{ margin: 0, fontSize: 18 }}>Template Library</h2>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
          {templates.length} templates
        </span>
      </div>
      <SearchBar search={search} onSearchChange={setSearch} />
      <CategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
      />
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading templates...</div>
      ) : (
        <TemplateGrid
          templates={filteredTemplates}
          copiedId={copiedId}
          onCopy={handleCopy}
          onSelect={handleInstall}
        />
      )}
      {!loading && filteredTemplates.length === 0 && <EmptyState />}
      {selectedTemplate && (
        <TemplateInstallModal
          template={selectedTemplate}
          projectId={projectId}
          onClose={() => setSelectedTemplate(null)}
          onSuccess={() => {
            setSelectedTemplate(null);
            onSuccess?.();
          }}
        />
      )}
    </div>
  );
}

function SearchBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
          }}
        />
        <input
          className="input"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>
    </div>
  );
}

function CategoryPills({
  selectedCategory,
  onSelectCategory,
  categories,
}: {
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  categories: string[];
}) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      <button
        className="btn"
        style={{
          background: !selectedCategory ? '#3b82f6' : '#2a2a2a',
          padding: '4px 12px',
          fontSize: 12,
        }}
        onClick={() => onSelectCategory(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className="btn"
          style={{
            background: selectedCategory === cat ? '#3b82f6' : '#2a2a2a',
            padding: '4px 12px',
            fontSize: 12,
          }}
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function TemplateGrid({
  templates,
  copiedId,
  onCopy,
  onSelect,
}: {
  templates: Template[];
  copiedId: string | null;
  onCopy: (t: Template) => void;
  onSelect: (t: Template) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isCopied={copiedId === template.id}
          onCopy={onCopy}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  template,
  isCopied,
  onCopy,
  onSelect,
}: {
  template: TemplateSummary;
  isCopied: boolean;
  onCopy: (t: TemplateSummary) => void;
  onSelect: (t: TemplateSummary) => void;
}) {
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
          <FileText size={18} style={{ color: '#3b82f6' }} />
          <span style={{ fontWeight: 500 }}>{template.name}</span>
        </div>
        <button
          className="btn"
          style={{ background: '#2a2a2a', padding: '4px 8px' }}
          onClick={(e) => {
            e.stopPropagation();
            onCopy(template);
          }}
          title="Copy template details"
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>{template.description}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {template.tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '2px 8px',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#666' }}>
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

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
      <FileText size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
      <div>No templates found</div>
      <div className="small" style={{ marginTop: 8 }}>
        Try adjusting your search or filters
      </div>
    </div>
  );
}

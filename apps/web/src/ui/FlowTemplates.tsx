import { useState, useEffect } from 'react';
import { FileText, Search, Sparkles } from 'lucide-react';
import { getTemplates } from './api-flows';
import type { TemplateSummary } from './api-types';
import { TemplateInstallModal } from './TemplateInstallModal';
import { TemplateCard } from './TemplateCard';

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
    void loadTemplates();
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
    void navigator.clipboard.writeText(JSON.stringify(template, null, 2));
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
      <div className="templates-header">
        <Sparkles size={18} className="templates-icon" />
        <h2 style={{ margin: 0, fontSize: 18 }}>Template Library</h2>
        <span className="templates-count">
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
        <div className="templates-loading">
          Loading templates...
        </div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              isCopied={copiedId === t.id}
              onCopy={handleCopy}
              onSelect={handleInstall}
            />
          ))}
        </div>
      )}
      {!loading && filteredTemplates.length === 0 && (
        <div className="templates-empty">
          <FileText size={48} className="templates-empty-icon" />
          <div>No templates found</div>
          <div className="small" style={{ marginTop: 8 }}>
            Try adjusting your search or filters
          </div>
        </div>
      )}
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
    <div className="templates-search-wrap">
      <div className="templates-search-box">
        <Search size={16} className="templates-search-icon" />
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
    <div className="templates-category-pills">
      <button
        className={`btn templates-pill ${!selectedCategory ? 'templates-pill--active' : 'templates-pill--inactive'}`}
        onClick={() => onSelectCategory(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`btn templates-pill ${selectedCategory === cat ? 'templates-pill--active' : 'templates-pill--inactive'}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

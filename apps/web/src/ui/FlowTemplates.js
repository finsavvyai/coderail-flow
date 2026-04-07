import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FileText, Search, Sparkles } from 'lucide-react';
import { getTemplates } from './api-flows';
import { TemplateInstallModal } from './TemplateInstallModal';
import { TemplateCard } from './TemplateCard';
export function FlowTemplates({ projectId, onSuccess }) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    useEffect(() => {
        async function loadTemplates() {
            try {
                const data = await getTemplates();
                setTemplates(data);
            }
            catch (error) {
                console.error('Failed to load templates:', error);
            }
            finally {
                setLoading(false);
            }
        }
        void loadTemplates();
    }, []);
    const categories = Array.from(new Set(templates.map((t) => t.category)));
    const filteredTemplates = templates.filter((t) => {
        const matchesSearch = search === '' ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = !selectedCategory || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    function handleCopy(template) {
        void navigator.clipboard.writeText(JSON.stringify(template, null, 2));
        setCopiedId(template.id);
        setTimeout(() => setCopiedId(null), 2000);
    }
    function handleInstall(template) {
        if (!projectId) {
            alert('Please select a project first');
            return;
        }
        setSelectedTemplate(template);
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "templates-header", children: [_jsx(Sparkles, { size: 18, className: "templates-icon" }), _jsx("h2", { style: { margin: 0, fontSize: 18 }, children: "Template Library" }), _jsxs("span", { className: "templates-count", children: [templates.length, " templates"] })] }), _jsx(SearchBar, { search: search, onSearchChange: setSearch }), _jsx(CategoryPills, { selectedCategory: selectedCategory, onSelectCategory: setSelectedCategory, categories: categories }), loading ? (_jsx("div", { className: "templates-loading", children: "Loading templates..." })) : (_jsx("div", { className: "templates-grid", children: filteredTemplates.map((t) => (_jsx(TemplateCard, { template: t, isCopied: copiedId === t.id, onCopy: handleCopy, onSelect: handleInstall }, t.id))) })), !loading && filteredTemplates.length === 0 && (_jsxs("div", { className: "templates-empty", children: [_jsx(FileText, { size: 48, className: "templates-empty-icon" }), _jsx("div", { children: "No templates found" }), _jsx("div", { className: "small", style: { marginTop: 8 }, children: "Try adjusting your search or filters" })] })), selectedTemplate && (_jsx(TemplateInstallModal, { template: selectedTemplate, projectId: projectId, onClose: () => setSelectedTemplate(null), onSuccess: () => {
                    setSelectedTemplate(null);
                    onSuccess?.();
                } }))] }));
}
function SearchBar({ search, onSearchChange, }) {
    return (_jsx("div", { className: "templates-search-wrap", children: _jsxs("div", { className: "templates-search-box", children: [_jsx(Search, { size: 16, className: "templates-search-icon" }), _jsx("input", { className: "input", placeholder: "Search templates...", value: search, onChange: (e) => onSearchChange(e.target.value), style: { paddingLeft: 36 } })] }) }));
}
function CategoryPills({ selectedCategory, onSelectCategory, categories, }) {
    return (_jsxs("div", { className: "templates-category-pills", children: [_jsx("button", { className: `btn templates-pill ${!selectedCategory ? 'templates-pill--active' : 'templates-pill--inactive'}`, onClick: () => onSelectCategory(null), children: "All" }), categories.map((cat) => (_jsx("button", { className: `btn templates-pill ${selectedCategory === cat ? 'templates-pill--active' : 'templates-pill--inactive'}`, onClick: () => onSelectCategory(cat), children: cat }, cat)))] }));
}

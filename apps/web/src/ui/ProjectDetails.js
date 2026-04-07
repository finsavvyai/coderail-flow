import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Folder, FileText, Target, Plus, Video, Webhook, Cookie, Sparkles } from 'lucide-react';
export function ProjectDetails({ selectedProject, screens, elements, setView, }) {
    if (!selectedProject) {
        return (_jsx("div", { className: "card project-empty-state", children: _jsxs("div", { className: "project-empty-content", children: [_jsx(Folder, { size: 64, className: "project-empty-icon" }), _jsx("div", { children: "Select a project or create a new one to get started" })] }) }));
    }
    return (_jsxs("div", { className: "project-detail-container", children: [_jsx(ProjectHeader, { project: selectedProject, setView: setView }), _jsx(ProjectStats, { screens: screens, elements: elements }), _jsx(ScreensList, { screens: screens, elements: elements })] }));
}
function ProjectHeader({ project, setView }) {
    return (_jsx("div", { className: "card", children: _jsxs("div", { className: "project-header-row", children: [_jsxs("div", { children: [_jsx("div", { className: "h1 project-header-title", children: project.name }), _jsx("div", { className: "small project-header-url", children: project.base_url })] }), _jsxs("div", { className: "project-header-actions", children: [_jsxs("button", { className: "btn btn-accent", onClick: () => setView('templates'), children: [_jsx(Sparkles, { size: 16 }), " Templates"] }), _jsxs("button", { className: "btn btn-secondary", onClick: () => setView('element-mapper'), children: [_jsx(Target, { size: 16 }), " Map Elements"] }), _jsxs("button", { className: "btn btn-secondary", onClick: () => setView('integrations'), children: [_jsx(Webhook, { size: 16 }), " Integrations"] }), _jsxs("button", { className: "btn btn-secondary", onClick: () => setView('auth-profiles'), children: [_jsx(Cookie, { size: 16 }), " Auth Profiles"] }), _jsxs("button", { className: "btn btn-danger", onClick: () => setView('flow-recorder'), children: [_jsx(Video, { size: 16 }), " Record Flow"] }), _jsxs("button", { className: "btn", onClick: () => setView('flow-builder'), children: [_jsx(Plus, { size: 16 }), " New Flow"] })] })] }) }));
}
function ProjectStats({ screens, elements }) {
    return (_jsx("div", { className: "card", children: _jsxs("div", { className: "project-stats-grid", children: [_jsx(StatCard, { label: "Screens", value: screens.length, colorClass: "stat-color-purple" }), _jsx(StatCard, { label: "Elements", value: elements.length, colorClass: "stat-color-success" }), _jsx(StatCard, { label: "Flows", value: 0, colorClass: "stat-color-warning" })] }) }));
}
function StatCard({ label, value, colorClass, }) {
    return (_jsxs("div", { className: "project-stat-card", children: [_jsx("div", { className: "small project-stat-label", children: label }), _jsx("div", { className: `project-stat-value ${colorClass}`, children: value })] }));
}
function ScreensList({ screens, elements }) {
    return (_jsxs("div", { className: "card project-screens-list", children: [_jsx("div", { className: "h2 project-screens-heading", children: "Screens & Elements" }), screens.length === 0 ? (_jsxs("div", { className: "project-screens-empty", children: [_jsx(FileText, { size: 48, className: "project-empty-icon" }), _jsx("div", { children: "No screens yet. Use the Element Mapper to create screens and map elements." })] })) : (_jsx("div", { className: "project-screens-column", children: screens.map((screen) => {
                    const screenElements = elements.filter((e) => e.screen_id === screen.id);
                    return (_jsxs("div", { className: "project-screen-item", children: [_jsxs("div", { className: "project-screen-header", children: [_jsxs("div", { children: [_jsx("div", { className: "project-screen-name", children: screen.name }), _jsx("div", { className: "small project-screen-path", children: screen.url_path })] }), _jsxs("span", { className: "badge", children: [screenElements.length, " elements"] })] }), screenElements.length > 0 && (_jsx("div", { className: "project-element-tags", children: screenElements.map((el) => (_jsxs("div", { className: "project-element-tag", children: [_jsx(Target, { size: 12, className: "project-element-tag-icon" }), el.name] }, el.id))) }))] }, screen.id));
                }) }))] }));
}

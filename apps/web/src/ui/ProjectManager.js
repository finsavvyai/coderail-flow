import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFlow } from './api';
import { FlowBuilder } from './FlowBuilder';
import { ElementMapper } from './ElementMapper';
import { FlowRecorder } from './FlowRecorder';
import { IntegrationsPage } from './IntegrationsPage';
import { CookieManager } from './CookieManager';
import { FlowTemplates } from './FlowTemplates';
import { useProjectManager } from './useProjectManager';
import { ProjectDetails } from './ProjectDetails';
import { ProjectSidebar } from './ProjectForm';
export function ProjectManager() {
    const pm = useProjectManager();
    if (pm.view === 'flow-builder' && pm.selectedProject) {
        return (_jsx(FlowBuilder, { projectId: pm.selectedProject.id, onSave: () => pm.setView('list'), onCancel: () => pm.setView('list') }));
    }
    if (pm.view === 'element-mapper' && pm.selectedProject) {
        return (_jsx(ElementMapper, { projectId: pm.selectedProject.id, onSave: () => {
                pm.setView('list');
                void pm.loadScreens(pm.selectedProject.id);
            }, onCancel: () => pm.setView('list') }));
    }
    if (pm.view === 'flow-recorder' && pm.selectedProject) {
        return (_jsx(FlowRecorder, { onSaveFlow: async (steps, name) => {
                try {
                    await createFlow({
                        projectId: pm.selectedProject.id,
                        name,
                        description: `Recorded flow: ${name}`,
                        definition: { params: [], steps },
                    });
                    pm.setView('list');
                }
                catch (e) {
                    pm.setError(e.message);
                }
            }, onCancel: () => pm.setView('list') }));
    }
    if (pm.view === 'integrations' && pm.selectedProject) {
        return (_jsxs("div", { className: "pm-subpage", children: [_jsx("button", { className: "btn btn-back", onClick: () => pm.setView('list'), children: "\u2190 Back to Project" }), _jsx(IntegrationsPage, { projectId: pm.selectedProject.id })] }));
    }
    if (pm.view === 'auth-profiles' && pm.selectedProject) {
        return (_jsx("div", { className: "pm-subpage", children: _jsx(CookieManager, { projectId: pm.selectedProject.id, onClose: () => pm.setView('list') }) }));
    }
    if (pm.view === 'templates' && pm.selectedProject) {
        return (_jsxs("div", { className: "pm-subpage", children: [_jsx("button", { className: "btn btn-back", onClick: () => pm.setView('list'), children: "\u2190 Back to Project" }), _jsx(FlowTemplates, { projectId: pm.selectedProject.id, onSuccess: () => pm.setView('list') })] }));
    }
    return (_jsxs("div", { className: "pm-layout", children: [_jsx(ProjectSidebar, { projects: pm.projects, selectedProject: pm.selectedProject, onSelectProject: pm.setSelectedProject, newProjectName: pm.newProjectName, onNameChange: pm.setNewProjectName, newProjectUrl: pm.newProjectUrl, onUrlChange: pm.setNewProjectUrl, onCreateProject: pm.handleCreateProject, loading: pm.loading, error: pm.error }), _jsx(ProjectDetails, { selectedProject: pm.selectedProject, screens: pm.screens, elements: pm.elements, setView: pm.setView })] }));
}

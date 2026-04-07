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
    return (
      <FlowBuilder
        projectId={pm.selectedProject.id}
        onSave={() => pm.setView('list')}
        onCancel={() => pm.setView('list')}
      />
    );
  }

  if (pm.view === 'element-mapper' && pm.selectedProject) {
    return (
      <ElementMapper
        projectId={pm.selectedProject.id}
        onSave={() => {
          pm.setView('list');
          void pm.loadScreens(pm.selectedProject.id);
        }}
        onCancel={() => pm.setView('list')}
      />
    );
  }

  if (pm.view === 'flow-recorder' && pm.selectedProject) {
    return (
      <FlowRecorder
        onSaveFlow={async (steps, name) => {
          try {
            await createFlow({
              projectId: pm.selectedProject.id,
              name,
              description: `Recorded flow: ${name}`,
              definition: { params: [], steps },
            });
            pm.setView('list');
          } catch (e: any) {
            pm.setError(e.message);
          }
        }}
        onCancel={() => pm.setView('list')}
      />
    );
  }

  if (pm.view === 'integrations' && pm.selectedProject) {
    return (
      <div className="pm-subpage">
        <button className="btn btn-back" onClick={() => pm.setView('list')}>
          &larr; Back to Project
        </button>
        <IntegrationsPage projectId={pm.selectedProject.id} />
      </div>
    );
  }

  if (pm.view === 'auth-profiles' && pm.selectedProject) {
    return (
      <div className="pm-subpage">
        <CookieManager projectId={pm.selectedProject.id} onClose={() => pm.setView('list')} />
      </div>
    );
  }

  if (pm.view === 'templates' && pm.selectedProject) {
    return (
      <div className="pm-subpage">
        <button className="btn btn-back" onClick={() => pm.setView('list')}>
          &larr; Back to Project
        </button>
        <FlowTemplates projectId={pm.selectedProject.id} onSuccess={() => pm.setView('list')} />
      </div>
    );
  }

  return (
    <div className="pm-layout">
      <ProjectSidebar
        projects={pm.projects}
        selectedProject={pm.selectedProject}
        onSelectProject={pm.setSelectedProject}
        newProjectName={pm.newProjectName}
        onNameChange={pm.setNewProjectName}
        newProjectUrl={pm.newProjectUrl}
        onUrlChange={pm.setNewProjectUrl}
        onCreateProject={pm.handleCreateProject}
        loading={pm.loading}
        error={pm.error}
      />
      <ProjectDetails
        selectedProject={pm.selectedProject}
        screens={pm.screens}
        elements={pm.elements}
        setView={pm.setView}
      />
    </div>
  );
}

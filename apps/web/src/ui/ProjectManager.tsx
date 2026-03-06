import { Plus, Folder } from 'lucide-react';
import { createFlow } from './api';
import { FlowBuilder } from './FlowBuilder';
import { ElementMapper } from './ElementMapper';
import { FlowRecorder } from './FlowRecorder';
import { IntegrationsPage } from './IntegrationsPage';
import { CookieManager } from './CookieManager';
import { FlowTemplates } from './FlowTemplates';
import { useProjectManager } from './useProjectManager';
import { ProjectDetails } from './ProjectDetails';

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
          pm.loadScreens(pm.selectedProject.id);
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
      <div style={{ padding: 24 }}>
        <button
          className="btn"
          onClick={() => pm.setView('list')}
          style={{ marginBottom: 16, background: '#2a2a2a' }}
        >
          &larr; Back to Project
        </button>
        <IntegrationsPage projectId={pm.selectedProject.id} />
      </div>
    );
  }

  if (pm.view === 'auth-profiles' && pm.selectedProject) {
    return (
      <div style={{ padding: 24 }}>
        <CookieManager projectId={pm.selectedProject.id} onClose={() => pm.setView('list')} />
      </div>
    );
  }

  if (pm.view === 'templates' && pm.selectedProject) {
    return (
      <div style={{ padding: 24 }}>
        <button
          className="btn"
          onClick={() => pm.setView('list')}
          style={{ marginBottom: 16, background: '#2a2a2a' }}
        >
          &larr; Back to Project
        </button>
        <FlowTemplates
          projectId={pm.selectedProject.id}
          onSuccess={() => pm.setView('list')}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 16 }}>
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

function ProjectSidebar({
  projects,
  selectedProject,
  onSelectProject,
  newProjectName,
  onNameChange,
  newProjectUrl,
  onUrlChange,
  onCreateProject,
  loading,
  error,
}: {
  projects: any[];
  selectedProject: any;
  onSelectProject: (p: any) => void;
  newProjectName: string;
  onNameChange: (v: string) => void;
  newProjectUrl: string;
  onUrlChange: (v: string) => void;
  onCreateProject: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card">
        <div className="h2" style={{ marginBottom: 12 }}>
          Projects
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            className="input"
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => onNameChange(e.target.value)}
            style={{ marginBottom: 4 }}
          />
          <input
            className="input"
            placeholder="Base URL (https://...)"
            value={newProjectUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <button
            className="btn"
            onClick={onCreateProject}
            disabled={loading}
            style={{ width: '100%' }}
          >
            <Plus size={16} /> Create Project
          </button>
        </div>
        {error && (
          <div
            style={{
              padding: 8,
              background: '#2a1a1a',
              border: '1px solid #f44336',
              borderRadius: 6,
              color: '#ff9aa2',
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p)}
              style={{
                padding: 10,
                background: selectedProject?.id === p.id ? 'rgba(99,102,241,0.15)' : '#1a1a1a',
                border: `1px solid ${selectedProject?.id === p.id ? '#6366f1' : '#2a2a2a'}`,
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Folder size={16} style={{ color: '#6366f1' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                  <div className="small" style={{ color: '#8b8b8b' }}>
                    {p.base_url}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

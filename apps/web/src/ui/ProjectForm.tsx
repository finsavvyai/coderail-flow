import { Plus, Folder } from 'lucide-react';

interface ProjectSidebarProps {
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
}

export function ProjectSidebar({
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
}: ProjectSidebarProps) {
  return (
    <div className="project-sidebar">
      <div className="card">
        <div className="h2" style={{ marginBottom: 12 }}>
          Projects
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="project-name" className="sr-only">
            Project name
          </label>
          <input
            id="project-name"
            className="input"
            placeholder="Project name"
            aria-label="Project name"
            value={newProjectName}
            onChange={(e) => onNameChange(e.target.value)}
            style={{ marginBottom: 4 }}
          />
          <label htmlFor="project-url" className="sr-only">
            Base URL
          </label>
          <input
            id="project-url"
            className="input"
            placeholder="Base URL (https://...)"
            aria-label="Base URL"
            value={newProjectUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <button className="btn btn-fullwidth" onClick={onCreateProject} disabled={loading}>
            <Plus size={16} /> Create Project
          </button>
        </div>
        {error && <div className="project-error">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p)}
              className={`project-item ${selectedProject?.id === p.id ? 'project-item--selected' : 'project-item--default'}`}
            >
              <div className="project-item-row">
                <Folder size={16} className="project-item-icon" />
                <div className="project-item-info">
                  <div className="project-item-name">{p.name}</div>
                  <div className="small project-item-url">{p.base_url}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

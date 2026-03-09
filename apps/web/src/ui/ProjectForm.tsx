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
    <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card">
        <div className="h2" style={{ marginBottom: 12 }}>
          Projects
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="project-name" className="sr-only">Project name</label>
          <input
            id="project-name"
            className="input"
            placeholder="Project name"
            aria-label="Project name"
            value={newProjectName}
            onChange={(e) => onNameChange(e.target.value)}
            style={{ marginBottom: 4 }}
          />
          <label htmlFor="project-url" className="sr-only">Base URL</label>
          <input
            id="project-url"
            className="input"
            placeholder="Base URL (https://...)"
            aria-label="Base URL"
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
              color: '#fca5a5',
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
                  <div className="small" style={{ color: '#a8b3cf' }}>
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

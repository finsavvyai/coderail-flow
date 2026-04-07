import { Folder, FileText, Target, Plus, Video, Webhook, Cookie, Sparkles } from 'lucide-react';
import { ProjectView } from './useProjectManager';

interface ProjectDetailsProps {
  selectedProject: any;
  screens: any[];
  elements: any[];
  setView: (view: ProjectView) => void;
}

export function ProjectDetails({
  selectedProject,
  screens,
  elements,
  setView,
}: ProjectDetailsProps) {
  if (!selectedProject) {
    return (
      <div className="card project-empty-state">
        <div className="project-empty-content">
          <Folder size={64} className="project-empty-icon" />
          <div>Select a project or create a new one to get started</div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <ProjectHeader project={selectedProject} setView={setView} />
      <ProjectStats screens={screens} elements={elements} />
      <ScreensList screens={screens} elements={elements} />
    </div>
  );
}

function ProjectHeader({ project, setView }: { project: any; setView: (v: ProjectView) => void }) {
  return (
    <div className="card">
      <div className="project-header-row">
        <div>
          <div className="h1 project-header-title">{project.name}</div>
          <div className="small project-header-url">{project.base_url}</div>
        </div>
        <div className="project-header-actions">
          <button className="btn btn-accent" onClick={() => setView('templates')}>
            <Sparkles size={16} /> Templates
          </button>
          <button className="btn btn-secondary" onClick={() => setView('element-mapper')}>
            <Target size={16} /> Map Elements
          </button>
          <button className="btn btn-secondary" onClick={() => setView('integrations')}>
            <Webhook size={16} /> Integrations
          </button>
          <button className="btn btn-secondary" onClick={() => setView('auth-profiles')}>
            <Cookie size={16} /> Auth Profiles
          </button>
          <button className="btn btn-danger" onClick={() => setView('flow-recorder')}>
            <Video size={16} /> Record Flow
          </button>
          <button className="btn" onClick={() => setView('flow-builder')}>
            <Plus size={16} /> New Flow
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectStats({ screens, elements }: { screens: any[]; elements: any[] }) {
  return (
    <div className="card">
      <div className="project-stats-grid">
        <StatCard label="Screens" value={screens.length} colorClass="stat-color-purple" />
        <StatCard label="Elements" value={elements.length} colorClass="stat-color-success" />
        <StatCard label="Flows" value={0} colorClass="stat-color-warning" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="project-stat-card">
      <div className="small project-stat-label">{label}</div>
      <div className={`project-stat-value ${colorClass}`}>{value}</div>
    </div>
  );
}

function ScreensList({ screens, elements }: { screens: any[]; elements: any[] }) {
  return (
    <div className="card project-screens-list">
      <div className="h2 project-screens-heading">Screens & Elements</div>
      {screens.length === 0 ? (
        <div className="project-screens-empty">
          <FileText size={48} className="project-empty-icon" />
          <div>No screens yet. Use the Element Mapper to create screens and map elements.</div>
        </div>
      ) : (
        <div className="project-screens-column">
          {screens.map((screen) => {
            const screenElements = elements.filter((e) => e.screen_id === screen.id);
            return (
              <div key={screen.id} className="project-screen-item">
                <div className="project-screen-header">
                  <div>
                    <div className="project-screen-name">{screen.name}</div>
                    <div className="small project-screen-path">{screen.url_path}</div>
                  </div>
                  <span className="badge">{screenElements.length} elements</span>
                </div>
                {screenElements.length > 0 && (
                  <div className="project-element-tags">
                    {screenElements.map((el) => (
                      <div key={el.id} className="project-element-tag">
                        <Target size={12} className="project-element-tag-icon" />
                        {el.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

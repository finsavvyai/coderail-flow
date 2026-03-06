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
      <div
        className="card"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ textAlign: 'center', color: '#8b8b8b' }}>
          <Folder size={64} style={{ marginBottom: 16, opacity: 0.5 }} />
          <div>Select a project or create a new one to get started</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ProjectHeader project={selectedProject} setView={setView} />
      <ProjectStats screens={screens} elements={elements} />
      <ScreensList screens={screens} elements={elements} />
    </div>
  );
}

function ProjectHeader({ project, setView }: { project: any; setView: (v: ProjectView) => void }) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div>
          <div className="h1" style={{ marginBottom: 4 }}>
            {project.name}
          </div>
          <div className="small" style={{ color: '#8b8b8b' }}>
            {project.base_url}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => setView('templates')}
            style={{ background: '#3b82f6' }}
          >
            <Sparkles size={16} /> Templates
          </button>
          <button
            className="btn"
            onClick={() => setView('element-mapper')}
            style={{ background: '#1a1a1a' }}
          >
            <Target size={16} /> Map Elements
          </button>
          <button
            className="btn"
            onClick={() => setView('integrations')}
            style={{ background: '#1a1a1a' }}
          >
            <Webhook size={16} /> Integrations
          </button>
          <button
            className="btn"
            onClick={() => setView('auth-profiles')}
            style={{ background: '#1a1a1a' }}
          >
            <Cookie size={16} /> Auth Profiles
          </button>
          <button
            className="btn"
            onClick={() => setView('flow-recorder')}
            style={{ background: '#dc2626' }}
          >
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard label="Screens" value={screens.length} color="#6366f1" />
        <StatCard label="Elements" value={elements.length} color="#4ade80" />
        <StatCard label="Flows" value={0} color="#facc15" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{ padding: 16, background: '#1a1a1a', borderRadius: 8, border: '1px solid #2a2a2a' }}
    >
      <div className="small" style={{ color: '#8b8b8b', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

function ScreensList({ screens, elements }: { screens: any[]; elements: any[] }) {
  return (
    <div className="card" style={{ flex: 1, overflow: 'auto' }}>
      <div className="h2" style={{ marginBottom: 12 }}>
        Screens & Elements
      </div>
      {screens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8b8b8b' }}>
          <FileText size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <div>No screens yet. Use the Element Mapper to create screens and map elements.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {screens.map((screen) => {
            const screenElements = elements.filter((e) => e.screen_id === screen.id);
            return (
              <div
                key={screen.id}
                style={{
                  padding: 12,
                  background: '#1a1a1a',
                  borderRadius: 8,
                  border: '1px solid #2a2a2a',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{screen.name}</div>
                    <div className="small" style={{ color: '#8b8b8b' }}>
                      {screen.url_path}
                    </div>
                  </div>
                  <span className="badge">{screenElements.length} elements</span>
                </div>
                {screenElements.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {screenElements.map((el) => (
                      <div
                        key={el.id}
                        style={{
                          padding: '4px 10px',
                          background: '#2a2a2a',
                          borderRadius: 4,
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Target size={12} style={{ color: '#6366f1' }} />
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

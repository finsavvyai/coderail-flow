interface AppHeaderProps {
  err: string;
}

export function AppHeader({ err }: AppHeaderProps) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="h1" style={{ marginBottom: 4 }}>
            CodeRail Flow
          </div>
          <div className="small app-header-subtitle">Automated Browser Workflows</div>
        </div>
        <div className="badge badge-production">PRODUCTION READY</div>
      </div>
      {err && <div className="small app-header-error">{err}</div>}
    </div>
  );
}

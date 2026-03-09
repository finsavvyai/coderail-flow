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
          <div className="small" style={{ color: '#a8b3cf' }}>
            Automated Browser Workflows
          </div>
        </div>
        <div className="badge" style={{ backgroundColor: '#22c55e', color: '#fff', fontSize: 11 }}>
          PRODUCTION READY
        </div>
      </div>
      {err && (
        <div
          className="small"
          style={{
            marginTop: 10,
            padding: 12,
            backgroundColor: '#2a1a1a',
            border: '1px solid #f44336',
            borderRadius: 6,
            color: '#fca5a5',
          }}
        >
          {err}
        </div>
      )}
    </div>
  );
}

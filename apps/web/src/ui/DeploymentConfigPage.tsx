import type { ReactNode } from 'react';

type DeploymentConfigPageProps = {
  title: string;
  body: string;
  actions?: ReactNode;
  issues?: Array<{ code: string; message: string }>;
};

export function DeploymentConfigPage({
  title,
  body,
  actions,
  issues = [],
}: DeploymentConfigPageProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'radial-gradient(circle at top, rgba(244, 114, 182, 0.16), transparent 36%), radial-gradient(circle at bottom right, rgba(125, 211, 252, 0.16), transparent 28%), #07111f',
      }}
    >
      <section
        className="card"
        role="alert"
        style={{
          width: 'min(640px, 100%)',
          padding: 28,
        }}
      >
        <div className="eyebrow" style={{ color: '#fda4af', marginBottom: 12 }}>
          Deployment Configuration
        </div>
        <h1 className="h1" style={{ marginBottom: 12 }}>
          {title}
        </h1>
        <p className="body" style={{ marginBottom: 20, color: '#a8b3cf' }}>
          {body}
        </p>
        {issues.length > 0 ? (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 12,
              border: '1px solid rgba(253, 164, 175, 0.3)',
              background: 'rgba(20, 24, 36, 0.85)',
            }}
          >
            {issues.map((issue) => (
              <div key={issue.code} style={{ marginBottom: 10, color: '#fbcfe8' }}>
                <strong style={{ color: '#fecdd3' }}>{issue.code}</strong>
                <div>{issue.message}</div>
              </div>
            ))}
          </div>
        ) : null}
        {actions}
      </section>
    </main>
  );
}

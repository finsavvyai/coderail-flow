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
    <main className="deploy-config-backdrop">
      <section
        className="card deploy-config-card"
        role="alert"
      >
        <div className="eyebrow deploy-config-eyebrow">
          Deployment Configuration
        </div>
        <h1 className="h1" style={{ marginBottom: 12 }}>
          {title}
        </h1>
        <p className="body deploy-config-body">
          {body}
        </p>
        {issues.length > 0 ? (
          <div className="deploy-config-issues">
            {issues.map((issue) => (
              <div key={issue.code} className="deploy-config-issue">
                <strong>{issue.code}</strong>
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

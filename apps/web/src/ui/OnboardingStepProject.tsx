import type { ProjectFormState } from './OnboardingWizard.types';

export function OnboardingStepProject({
  projectName,
  setProjectName,
  projectUrl,
  setProjectUrl,
}: ProjectFormState) {
  return (
    <div style={{ padding: '32px 24px' }}>
      <h3 style={{ margin: '0 0 24px', fontSize: 20 }}>Let's set up your first project</h3>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="onboarding-project-name" style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
          Project Name
        </label>
        <input
          id="onboarding-project-name"
          className="input"
          type="text"
          placeholder="My Awesome Project"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{ fontSize: 14 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="onboarding-project-url" style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
          Base URL
        </label>
        <input
          id="onboarding-project-url"
          className="input"
          type="url"
          placeholder="https://example.com"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          style={{ fontSize: 14 }}
        />
        <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
          The website you want to automate or test
        </div>
      </div>
      <div
        style={{
          padding: 12,
          background: '#0a1628',
          borderRadius: 8,
          border: '1px solid #3b82f6',
          fontSize: 12,
          color: '#888',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: '#3b82f6' }}>Tip:</strong> You can add more projects and
            configure advanced settings later from the dashboard.
      </div>
    </div>
  );
}

import type { ProjectFormState } from './OnboardingWizard.types';

export function OnboardingStepProject({
  projectName,
  setProjectName,
  projectUrl,
  setProjectUrl,
}: ProjectFormState) {
  return (
    <div className="onboarding-step-body">
      <h3 className="onboarding-step-heading">Let's set up your first project</h3>
      <div className="onboarding-input-group">
        <label htmlFor="onboarding-project-name">Project Name</label>
        <input
          id="onboarding-project-name"
          className="input"
          type="text"
          placeholder="My Awesome Project"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>
      <div className="onboarding-input-group">
        <label htmlFor="onboarding-project-url">Base URL</label>
        <input
          id="onboarding-project-url"
          className="input"
          type="url"
          placeholder="https://example.com"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
        />
        <div className="onboarding-input-hint">
          The website you want to automate or test
        </div>
      </div>
      <div className="onboarding-tip-box">
        <strong className="onboarding-tip-label">Tip:</strong> You can add more projects and configure
        advanced settings later from the dashboard.
      </div>
    </div>
  );
}

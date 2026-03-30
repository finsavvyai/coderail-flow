import { Target, Zap, Shield, Sparkles } from 'lucide-react';
import { FeatureItem } from './OnboardingWizardParts';

export function OnboardingStepWelcome() {
  return (
    <div className="onboarding-welcome-wrapper">
      <div className="onboarding-welcome-hero-icon">
        <Sparkles size={40} className="onboarding-icon-white" />
      </div>
      <h2 className="onboarding-welcome-heading">Welcome to CodeRail Flow!</h2>
      <p className="onboarding-complete-text">
        The fastest way to create, test, and document browser automations
      </p>
      <div className="onboarding-welcome-list">
        <FeatureItem
          icon={<Target size={20} className="onboarding-icon-accent" />}
          title="Record Flows"
          description="Capture browser actions as reusable automated workflows"
        />
        <FeatureItem
          icon={<Zap size={20} className="onboarding-icon-success" />}
          title="Test Automatically"
          description="Run flows on schedule or trigger them from webhooks"
        />
        <FeatureItem
          icon={<Shield size={20} className="onboarding-icon-warning" />}
          title="Document Instantly"
          description="Generate videos, screenshots, and step-by-step guides"
        />
      </div>
    </div>
  );
}

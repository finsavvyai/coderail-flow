import { Check } from 'lucide-react';
import { NextStep } from './OnboardingWizardParts';

interface OnboardingStepCompleteProps {
  onFinish: () => void;
}

export function OnboardingStepComplete({ onFinish }: OnboardingStepCompleteProps) {
  return (
    <div className="onboarding-welcome-wrapper">
      <div className="onboarding-complete-hero-icon">
        <Check size={40} className="onboarding-icon-white" />
      </div>
      <h2 className="onboarding-welcome-heading">You're ready to go!</h2>
      <p className="onboarding-complete-text">Your project is set up and ready for automation</p>
      <div className="onboarding-next-steps-box">
        <div className="onboarding-next-steps-label">Next Steps:</div>
        <NextStep number={1} text="Record your first flow" />
        <NextStep number={2} text="Test it instantly" />
        <NextStep number={3} text="Share with your team" />
      </div>
      <button onClick={onFinish} className="btn onboarding-finish-btn">
        Get Started
      </button>
    </div>
  );
}

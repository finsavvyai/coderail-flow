import React from 'react';

export function OnboardingProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="onboarding-progress-track">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`onboarding-progress-dot ${i <= step ? 'active' : 'inactive'}`}
        />
      ))}
    </div>
  );
}

export function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="onboarding-welcome-item">
      <div className="onboarding-welcome-icon">{icon}</div>
      <div>
        <div className="onboarding-step-title">{title}</div>
        <div className="onboarding-step-desc">{description}</div>
      </div>
    </div>
  );
}

export function OptionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="onboarding-step-card">
      <div className="onboarding-welcome-icon" style={{ marginBottom: 8 }}>{icon}</div>
      <div className="onboarding-step-title">{title}</div>
      <div className="onboarding-step-desc">{description}</div>
    </button>
  );
}

export function NextStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="onboarding-welcome-item">
      <div className="onboarding-next-step-num">{number}</div>
      <div className="onboarding-step-desc" style={{ paddingTop: 2 }}>{text}</div>
    </div>
  );
}

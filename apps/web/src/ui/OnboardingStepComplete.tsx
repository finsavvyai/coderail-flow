import { Check } from 'lucide-react';
import { NextStep } from './OnboardingWizardParts';

interface OnboardingStepCompleteProps {
  onFinish: () => void;
}

export function OnboardingStepComplete({ onFinish }: OnboardingStepCompleteProps) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 24px' }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
      >
        <Check size={40} style={{ color: 'white' }} />
      </div>
      <h2 style={{ margin: '0 0 12px', fontSize: 24 }}>You're ready to go!</h2>
      <p style={{ margin: '0 0 24px', color: '#a3a3a3', fontSize: 15 }}>
        Your project is set up and ready for automation
      </p>
      <div
        style={{
          padding: 16,
          background: '#1a1a1a',
          borderRadius: 8,
          border: '1px solid #2a2a2a',
          textAlign: 'left',
          maxWidth: 400,
          margin: '0 auto 24px',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Next Steps:</div>
        <NextStep number={1} text="Record your first flow" />
        <NextStep number={2} text="Test it instantly" />
        <NextStep number={3} text="Share with your team" />
      </div>
      <button
        onClick={onFinish}
        className="btn"
        style={{
          background: '#22c55e',
          padding: '12px 32px',
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        Get Started
      </button>
    </div>
  );
}

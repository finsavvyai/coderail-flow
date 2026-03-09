import { Target, Zap, Shield, Sparkles } from 'lucide-react';
import { FeatureItem } from './OnboardingWizardParts';

export function OnboardingStepWelcome() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 24px' }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
      >
        <Sparkles size={40} style={{ color: 'white' }} />
      </div>
      <h2 style={{ margin: '0 0 12px', fontSize: 24 }}>Welcome to CodeRail Flow!</h2>
      <p style={{ margin: '0 0 24px', color: '#888', fontSize: 15 }}>
        The fastest way to create, test, and document browser automations
      </p>
      <div style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
        <FeatureItem
          icon={<Target size={20} style={{ color: '#3b82f6' }} />}
          title="Record Flows"
          description="Capture browser actions as reusable automated workflows"
        />
        <FeatureItem
          icon={<Zap size={20} style={{ color: '#22c55e' }} />}
          title="Test Automatically"
          description="Run flows on schedule or trigger them from webhooks"
        />
        <FeatureItem
          icon={<Shield size={20} style={{ color: '#f59e0b' }} />}
          title="Document Instantly"
          description="Generate videos, screenshots, and step-by-step guides"
        />
      </div>
    </div>
  );
}

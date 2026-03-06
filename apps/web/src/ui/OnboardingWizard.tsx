import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Sparkles, Target, Zap, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

export function OnboardingWizard({ onComplete, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: 'Welcome to CodeRail Flow',
      icon: Sparkles,
      content: (
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
      ),
    },
    {
      title: 'Create Your First Project',
      icon: Target,
      content: (
        <div style={{ padding: '32px 24px' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 20 }}>Let's set up your first project</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              Project Name
            </label>
            <input
              className="input"
              type="text"
              placeholder="My Awesome Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              Base URL
            </label>
            <input
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
            <strong style={{ color: '#3b82f6' }}>💡 Tip:</strong> You can add more projects and
                configure advanced settings later from the dashboard.
          </div>
        </div>
      ),
    },
    {
      title: 'Choose Your Path',
      icon: Zap,
      content: (
        <div style={{ padding: '32px 24px' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 20 }}>How would you like to start?</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <OptionCard
              title="Record a Flow"
              description="Capture browser actions as you click through your website"
              icon="🎬"
              onClick={() => handleChoice('record')}
            />
            <OptionCard
              title="Use a Template"
              description="Start with a pre-built flow for common use cases"
              icon="📋"
              onClick={() => handleChoice('template')}
            />
            <OptionCard
              title="Build Manually"
              description="Create a flow step-by-step using the visual builder"
              icon="🔧"
              onClick={() => handleChoice('manual')}
            />
            <OptionCard
              title="Explore Dashboard"
              description="Learn the platform with our interactive guide"
              icon="📊"
              onClick={() => handleChoice('explore')}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'You're All Set!',
      icon: Check,
      content: (
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
          <p style={{ margin: '0 0 24px', color: '#888', fontSize: 15 }}>
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
            onClick={handleComplete}
            className="btn"
            style={{
              background: '#22c55e',
              padding: '12px 32px',
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Get Started →
          </button>
        </div>
      ),
    },
  ];

  async function handleCreateProject() {
    if (!projectName.trim() || !projectUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName.trim(),
          baseUrl: projectUrl.trim(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create project');
      }

      const data = await res.json();
      setProjectId(data.project.id);
      toast.success('Project created successfully!');
      setStep(step + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  function handleChoice(choice: string) {
    // Store choice for later
    sessionStorage.setItem('onboarding-choice', choice);
    handleComplete();
  }

  function handleComplete() {
    onComplete();
    toast.success('Welcome to CodeRail Flow! 🎉');
  }

  function handleNext() {
    if (step === 1 && !projectId) {
      handleCreateProject();
    } else {
      setStep(step + 1);
    }
  }

  function handleBack() {
    setStep(step - 1);
  }

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
            fontSize: 20,
          }}
        >
          ×
        </button>

        {/* Progress Bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: i <= step ? '#3b82f6' : '#2a2a2a',
                  border: i === step ? '2px solid #3b82f6' : '2px solid #2a2a2a',
                }}
              />
            ))}
          </div>
          <div
            style={{
              width: '100%',
              height: 2,
              background: '#2a2a2a',
              borderRadius: 1,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${(step / (steps.length - 1)) * 100}%`,
                background: '#3b82f6',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <StepIcon size={32} style={{ color: '#3b82f6', marginBottom: 12 }} />
          <h2 style={{ margin: 0, fontSize: 20 }}>{currentStep.title}</h2>
        </div>

        {/* Content */}
        {currentStep.content}

        {/* Navigation */}
        {step < steps.length - 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '24px',
              borderTop: '1px solid #2a2a2a',
            }}
          >
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="btn"
              style={{
                background: step === 0 ? '#2a2a2a' : '#1a1a1a',
                opacity: step === 0 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} style={{ display: 'inline', marginRight: 6 }} />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading || (step === 1 && (!projectName || !projectUrl))}
              className="btn"
              style={{
                background: loading ? '#2a2a2a' : '#3b82f6',
                opacity: loading || (step === 1 && (!projectName || !projectUrl)) ? 0.5 : 1,
              }}
            >
              {loading ? 'Creating...' : 'Continue'}
              <ChevronRight size={16} style={{ display: 'inline', marginLeft: 6 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  );
}

function OptionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #2a2a2a',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2a2a2a';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#888' }}>{description}</div>
    </button>
  );
}

function NextStep({ number, text }: { number: number; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#3b82f6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div style={{ fontSize: 13, color: '#ccc', paddingTop: 2 }}>{text}</div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Target, Zap, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OnboardingWizardProps, OnboardingStepDef } from './OnboardingWizard.types';
import { OnboardingProgressBar } from './OnboardingWizardParts';
import { OnboardingStepWelcome } from './OnboardingStepWelcome';
import { OnboardingStepProject } from './OnboardingStepProject';
import { OnboardingStepPath } from './OnboardingStepPath';
import { OnboardingStepComplete } from './OnboardingStepComplete';

export function OnboardingWizard({ onComplete, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChoice(choice: string) {
    sessionStorage.setItem('onboarding-choice', choice);
    handleComplete();
  }

  function handleComplete() {
    onComplete();
    toast.success('Welcome to CodeRail Flow!');
  }

  const steps: OnboardingStepDef[] = [
    {
      title: 'Welcome to CodeRail Flow',
      icon: Sparkles,
      content: <OnboardingStepWelcome />,
    },
    {
      title: 'Create Your First Project',
      icon: Target,
      content: (
        <OnboardingStepProject
          projectName={projectName}
          setProjectName={setProjectName}
          projectUrl={projectUrl}
          setProjectUrl={setProjectUrl}
        />
      ),
    },
    {
      title: 'Choose Your Path',
      icon: Zap,
      content: <OnboardingStepPath onChoice={handleChoice} />,
    },
    {
      title: "You're All Set!",
      icon: Check,
      content: <OnboardingStepComplete onFinish={handleComplete} />,
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

  function handleNext() {
    if (step === 1 && !projectId) {
      handleCreateProject();
    } else {
      setStep(step + 1);
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

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
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding wizard"
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
          aria-label="Close wizard"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#aaa',
            padding: 10,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <OnboardingProgressBar step={step} total={steps.length} />

        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <StepIcon size={32} style={{ color: '#3b82f6', marginBottom: 12 }} />
          <h2 style={{ margin: 0, fontSize: 20 }}>{currentStep.title}</h2>
        </div>

        {currentStep.content}

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
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="btn"
              style={{
                background: step === 0 ? '#2a2a2a' : '#1a1a1a',
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


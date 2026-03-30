import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Target, Zap, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OnboardingWizardProps, OnboardingStepDef } from './OnboardingWizard.types';
import { OnboardingProgressBar } from './OnboardingWizardParts';
import { OnboardingStepWelcome } from './OnboardingStepWelcome';
import { OnboardingStepProject } from './OnboardingStepProject';
import { OnboardingStepPath } from './OnboardingStepPath';
import { OnboardingStepComplete } from './OnboardingStepComplete';
import { apiUrl, getApiToken } from './api-core';

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
      const token = await getApiToken();
      const res = await fetch(apiUrl('/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      void handleCreateProject();
    } else {
      setStep(step + 1);
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div
      className="onboarding-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding wizard"
    >
      <div
        className="card onboarding-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close wizard"
          className="onboarding-close"
        >
          <X size={18} />
        </button>

        <OnboardingProgressBar step={step} total={steps.length} />

        <div className="onboarding-header">
          <StepIcon size={32} />
          <h2>{currentStep.title}</h2>
        </div>

        {currentStep.content}

        {step < steps.length - 1 && (
          <div className="onboarding-footer">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="onboarding-btn-back"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading || (step === 1 && (!projectName || !projectUrl))}
              className="onboarding-btn-next"
            >
              {loading ? 'Creating...' : 'Continue'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

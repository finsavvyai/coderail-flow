import { Video, FileText, Wrench, BarChart3 } from 'lucide-react';
import { OptionCard } from './OnboardingWizardParts';

interface OnboardingStepPathProps {
  onChoice: (choice: string) => void;
}

export function OnboardingStepPath({ onChoice }: OnboardingStepPathProps) {
  return (
    <div className="onboarding-step-body">
      <h3 className="onboarding-step-heading">How would you like to start?</h3>
      <div className="onboarding-path-grid">
        <OptionCard
          title="Record a Flow"
          description="Capture browser actions as you click through your website"
          icon={<Video size={28} />}
          onClick={() => onChoice('record')}
        />
        <OptionCard
          title="Use a Template"
          description="Start with a pre-built flow for common use cases"
          icon={<FileText size={28} />}
          onClick={() => onChoice('template')}
        />
        <OptionCard
          title="Build Manually"
          description="Create a flow step-by-step using the visual builder"
          icon={<Wrench size={28} />}
          onClick={() => onChoice('manual')}
        />
        <OptionCard
          title="Explore Dashboard"
          description="Learn the platform with our interactive guide"
          icon={<BarChart3 size={28} />}
          onClick={() => onChoice('explore')}
        />
      </div>
    </div>
  );
}

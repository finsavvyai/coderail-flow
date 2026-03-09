export interface OnboardingWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

export interface OnboardingStepDef {
  title: string;
  icon: React.ComponentType<{ size?: string | number; style?: React.CSSProperties }>;
  content: React.ReactNode;
}

export interface ProjectFormState {
  projectName: string;
  setProjectName: (v: string) => void;
  projectUrl: string;
  setProjectUrl: (v: string) => void;
}

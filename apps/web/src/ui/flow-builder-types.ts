export interface Step {
  type: string;
  [key: string]: any;
}

export interface FlowDefinition {
  params: Array<{ name: string; type: string; required: boolean }>;
  steps: Step[];
}

export interface StepTypeConfig {
  value: string;
  label: string;
  icon: string;
  category: string;
  fields: string[];
}

import type { StepTypeConfig } from './flow-builder-types';

export const STEP_TYPES_ADVANCED: StepTypeConfig[] = [
  // Assertion steps
  {
    value: 'assertText',
    label: 'Assert Text',
    icon: '\u{2705}',
    category: 'assertion',
    fields: ['text', 'elementId', 'narrate'],
  },
  {
    value: 'assertUrl',
    label: 'Assert URL',
    icon: '\u{1F517}',
    category: 'assertion',
    fields: ['pattern', 'narrate'],
  },
  {
    value: 'assertElement',
    label: 'Assert Element',
    icon: '\u{1F50D}',
    category: 'assertion',
    fields: ['elementId', 'assertion', 'narrate'],
  },
  // Wait steps
  {
    value: 'waitForNavigation',
    label: 'Wait Navigation',
    icon: '\u{23F3}',
    category: 'wait',
    fields: ['timeout'],
  },
  {
    value: 'waitForNetwork',
    label: 'Wait Network',
    icon: '\u{1F4E1}',
    category: 'wait',
    fields: ['urlPattern', 'timeout'],
  },
  // Capture steps
  {
    value: 'screenshot',
    label: 'Screenshot',
    icon: '\u{1F4F8}',
    category: 'capture',
    fields: ['label', 'fullPage'],
  },
  {
    value: 'pdf',
    label: 'Generate PDF',
    icon: '\u{1F4C4}',
    category: 'capture',
    fields: ['filename', 'format'],
  },
  {
    value: 'extractData',
    label: 'Extract Data',
    icon: '\u{1F4CA}',
    category: 'capture',
    fields: ['elementId', 'attribute', 'variableName', 'narrate'],
  },
  // Navigation steps
  {
    value: 'scroll',
    label: 'Scroll',
    icon: '\u{1F4DC}',
    category: 'navigation',
    fields: ['direction', 'elementId', 'pixels'],
  },
  {
    value: 'iframe',
    label: 'Iframe',
    icon: '\u{1F5BC}\u{FE0F}',
    category: 'navigation',
    fields: ['frameSelector', 'steps', 'narrate'],
  },
  // Device steps
  {
    value: 'setViewport',
    label: 'Set Viewport',
    icon: '\u{1F4F1}',
    category: 'device',
    fields: ['width', 'height', 'isMobile'],
  },
  {
    value: 'emulateDevice',
    label: 'Emulate Device',
    icon: '\u{FFFD}',
    category: 'device',
    fields: ['device'],
  },
  // Advanced steps
  {
    value: 'setCookies',
    label: 'Set Cookies',
    icon: '\u{1F36A}',
    category: 'advanced',
    fields: ['cookies'],
  },
  {
    value: 'executeScript',
    label: 'Run Script',
    icon: '\u{26A1}',
    category: 'advanced',
    fields: ['script', 'narrate'],
  },
  {
    value: 'setVariable',
    label: 'Set Variable',
    icon: '\u{1F4DD}',
    category: 'advanced',
    fields: ['name', 'value'],
  },
  // Control flow steps
  {
    value: 'loop',
    label: 'Loop',
    icon: '\u{1F504}',
    category: 'control',
    fields: ['times', 'steps', 'narrate'],
  },
  {
    value: 'conditional',
    label: 'Conditional',
    icon: '\u{2753}',
    category: 'control',
    fields: ['condition', 'thenSteps', 'elseSteps', 'narrate'],
  },
];

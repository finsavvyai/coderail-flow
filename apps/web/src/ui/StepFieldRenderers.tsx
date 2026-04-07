import type { Step } from './flow-builder-types';
import {
  InputField,
  SelectField,
  TextField,
  FullPageField,
  CookiesField,
} from './StepFieldRenderersInputs';

export interface FieldProps {
  step: Step;
  onUpdate: (updates: Partial<Step>) => void;
}

const PLACEMENT_OPTS = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];
const STYLE_OPTS = [
  { value: 'box', label: 'Box' },
  { value: 'pulse', label: 'Pulse' },
];
const STATE_OPTS = [
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
];
const DIR_OPTS = [
  { value: 'up', label: 'Up' },
  { value: 'down', label: 'Down' },
  { value: 'top', label: 'To Top' },
  { value: 'bottom', label: 'To Bottom' },
];

type FieldRenderer = (props: FieldProps) => JSX.Element;

const FIELD_MAP: Record<string, FieldRenderer> = {
  url: (p) => (
    <InputField
      {...p}
      label="URL"
      field="url"
      placeholder="https://example.com or leave empty to use screenId"
    />
  ),
  screenId: (p) => (
    <InputField {...p} label="Screen ID" field="screenId" placeholder="scr-dashboard" />
  ),
  elementId: (p) => (
    <InputField {...p} label="Element ID *" field="elementId" placeholder="el-search-btn" />
  ),
  text: (p) => <TextField {...p} />,
  value: (p) => (
    <InputField
      {...p}
      label="Value *"
      field="value"
      placeholder="Text to fill (use {{param}} for parameters)"
    />
  ),
  narrate: (p) => (
    <InputField
      {...p}
      label="Narration (optional)"
      field="narrate"
      placeholder="Spoken text for this step (appears in SRT subtitles)"
    />
  ),
  placement: (p) => (
    <SelectField
      {...p}
      label="Placement"
      field="placement"
      fallback="bottom"
      options={PLACEMENT_OPTS}
    />
  ),
  style: (p) => (
    <SelectField {...p} label="Highlight Style" field="style" fallback="box" options={STYLE_OPTS} />
  ),
  ms: (p) => (
    <InputField {...p} label="Duration (ms)" field="ms" placeholder="1000" type="number" />
  ),
  state: (p) => (
    <SelectField {...p} label="State" field="state" fallback="visible" options={STATE_OPTS} />
  ),
  matchText: (p) => (
    <InputField
      {...p}
      label="Match Text *"
      field="matchText"
      placeholder="Text to match in table row (use {{param}} for parameters)"
    />
  ),
  direction: (p) => (
    <SelectField {...p} label="Direction" field="direction" fallback="down" options={DIR_OPTS} />
  ),
  pixels: (p) => (
    <InputField {...p} label="Pixels (optional)" field="pixels" placeholder="300" type="number" />
  ),
  label: (p) => (
    <InputField
      {...p}
      label="Screenshot Label (optional)"
      field="label"
      placeholder="Label to show on screenshot"
    />
  ),
  fullPage: (p) => <FullPageField {...p} />,
  cookies: (p) => <CookiesField {...p} />,
};

export function renderStepFields(
  fields: string[],
  step: Step,
  onUpdate: (updates: Partial<Step>) => void
) {
  return fields.map((field) => {
    const render = FIELD_MAP[field];
    if (!render) return null;
    return <div key={field}>{render({ step, onUpdate })}</div>;
  });
}

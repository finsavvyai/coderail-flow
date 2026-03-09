import type { ReactNode } from 'react';
import type { Step } from './flow-builder-types';

export interface FieldProps {
  step: Step;
  onUpdate: (updates: Partial<Step>) => void;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="small" style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}>
      {children}
    </label>
  );
}

function InputField({ label, field, placeholder, step, onUpdate, type = 'text' }: {
  label: string; field: string; placeholder: string; type?: string;
} & FieldProps) {
  const isNumber = type === 'number';
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        className="input"
        type={type}
        placeholder={placeholder}
        value={(step as Record<string, any>)[field] || ''}
        onChange={(e) => onUpdate({
          [field]: isNumber ? (parseInt(e.target.value) || (field === 'pixels' ? undefined : 0)) : e.target.value,
        })}
      />
    </div>
  );
}

function SelectField({ label, field, options, step, onUpdate, fallback }: {
  label: string; field: string; fallback: string;
  options: { value: string; label: string }[];
} & FieldProps) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        className="input"
        value={(step as Record<string, any>)[field] || fallback}
        onChange={(e) => onUpdate({ [field]: e.target.value })}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextField({ step, onUpdate }: FieldProps) {
  return (
    <div>
      <FieldLabel>Caption Text *</FieldLabel>
      <textarea
        className="input"
        placeholder="This will appear as an overlay on the page"
        value={step.text || ''}
        onChange={(e) => onUpdate({ text: e.target.value })}
        rows={3}
      />
    </div>
  );
}

function FullPageField({ step, onUpdate }: FieldProps) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={step.fullPage || false}
          onChange={(e) => onUpdate({ fullPage: e.target.checked })}
        />
        Full Page Screenshot
      </label>
    </div>
  );
}

function CookiesField({ step, onUpdate }: FieldProps) {
  return (
    <div>
      <FieldLabel>Cookies (JSON array)</FieldLabel>
      <textarea
        className="input"
        placeholder='[{"name": "session", "value": "...", "domain": ".example.com"}]'
        value={JSON.stringify(step.cookies || [], null, 2)}
        onChange={(e) => {
          try { onUpdate({ cookies: JSON.parse(e.target.value) }); } catch { /* ignore */ }
        }}
        rows={4}
        style={{ fontFamily: 'monospace', fontSize: 11 }}
      />
    </div>
  );
}

const PLACEMENT_OPTS = [
  { value: 'top', label: 'Top' }, { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];
const STYLE_OPTS = [{ value: 'box', label: 'Box' }, { value: 'pulse', label: 'Pulse' }];
const STATE_OPTS = [{ value: 'visible', label: 'Visible' }, { value: 'hidden', label: 'Hidden' }];
const DIR_OPTS = [
  { value: 'up', label: 'Up' }, { value: 'down', label: 'Down' },
  { value: 'top', label: 'To Top' }, { value: 'bottom', label: 'To Bottom' },
];

type FieldRenderer = (props: FieldProps) => JSX.Element;

const FIELD_MAP: Record<string, FieldRenderer> = {
  url: (p) => <InputField {...p} label="URL" field="url"
    placeholder="https://example.com or leave empty to use screenId" />,
  screenId: (p) => <InputField {...p} label="Screen ID" field="screenId"
    placeholder="scr-dashboard" />,
  elementId: (p) => <InputField {...p} label="Element ID *" field="elementId"
    placeholder="el-search-btn" />,
  text: (p) => <TextField {...p} />,
  value: (p) => <InputField {...p} label="Value *" field="value"
    placeholder="Text to fill (use {{param}} for parameters)" />,
  narrate: (p) => <InputField {...p} label="Narration (optional)" field="narrate"
    placeholder="Spoken text for this step (appears in SRT subtitles)" />,
  placement: (p) => <SelectField {...p} label="Placement" field="placement"
    fallback="bottom" options={PLACEMENT_OPTS} />,
  style: (p) => <SelectField {...p} label="Highlight Style" field="style"
    fallback="box" options={STYLE_OPTS} />,
  ms: (p) => <InputField {...p} label="Duration (ms)" field="ms"
    placeholder="1000" type="number" />,
  state: (p) => <SelectField {...p} label="State" field="state"
    fallback="visible" options={STATE_OPTS} />,
  matchText: (p) => <InputField {...p} label="Match Text *" field="matchText"
    placeholder="Text to match in table row (use {{param}} for parameters)" />,
  direction: (p) => <SelectField {...p} label="Direction" field="direction"
    fallback="down" options={DIR_OPTS} />,
  pixels: (p) => <InputField {...p} label="Pixels (optional)" field="pixels"
    placeholder="300" type="number" />,
  label: (p) => <InputField {...p} label="Screenshot Label (optional)" field="label"
    placeholder="Label to show on screenshot" />,
  fullPage: (p) => <FullPageField {...p} />,
  cookies: (p) => <CookiesField {...p} />,
};

export function renderStepFields(
  fields: string[],
  step: Step,
  onUpdate: (updates: Partial<Step>) => void,
) {
  return fields.map((field) => {
    const render = FIELD_MAP[field];
    if (!render) return null;
    return <div key={field}>{render({ step, onUpdate })}</div>;
  });
}

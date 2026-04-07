import type { ReactNode } from 'react';
import type { FieldProps } from './StepFieldRenderers';

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="small field-label">{children}</label>;
}

export function InputField({
  label,
  field,
  placeholder,
  step,
  onUpdate,
  type = 'text',
}: {
  label: string;
  field: string;
  placeholder: string;
  type?: string;
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
        onChange={(e) =>
          onUpdate({
            [field]: isNumber
              ? parseInt(e.target.value) || (field === 'pixels' ? undefined : 0)
              : e.target.value,
          })
        }
      />
    </div>
  );
}

export function SelectField({
  label,
  field,
  options,
  step,
  onUpdate,
  fallback,
}: {
  label: string;
  field: string;
  fallback: string;
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
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextField({ step, onUpdate }: FieldProps) {
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

export function FullPageField({ step, onUpdate }: FieldProps) {
  return (
    <div>
      <label className="field-checkbox-label">
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

export function CookiesField({ step, onUpdate }: FieldProps) {
  return (
    <div>
      <FieldLabel>Cookies (JSON array)</FieldLabel>
      <textarea
        className="input field-cookies-textarea"
        placeholder='[{"name": "session", "value": "...", "domain": ".example.com"}]'
        value={JSON.stringify(step.cookies || [], null, 2)}
        onChange={(e) => {
          try {
            onUpdate({ cookies: JSON.parse(e.target.value) });
          } catch {
            /* ignore */
          }
        }}
        rows={4}
      />
    </div>
  );
}

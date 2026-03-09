interface TemplateParam {
  name: string;
  type: string;
  required?: boolean;
}

interface TemplateParamFormProps {
  params: TemplateParam[];
  values: Record<string, any>;
  onUpdate: (name: string, value: any) => void;
}

export function TemplateParamForm({ params, values, onUpdate }: TemplateParamFormProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
        Template Parameters
      </label>
      <div style={{ background: '#1a1a1a', padding: 12, borderRadius: 6 }}>
        {params.map((param) => (
          <div key={param.name} style={{ marginBottom: 12 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: 12,
                color: '#a3a3a3',
              }}
            >
              {param.name}
              {param.required && <span style={{ color: '#dc3545' }}> *</span>}
              <span style={{ marginLeft: 8, fontSize: 11, color: '#a3a3a3' }}>
                ({param.type})
              </span>
            </label>
            {param.type === 'number' ? (
              <input
                className="input"
                type="number"
                value={values[param.name] || ''}
                onChange={(e) => onUpdate(param.name, Number(e.target.value))}
                required={param.required}
              />
            ) : (
              <input
                className="input"
                type="text"
                value={values[param.name] || ''}
                onChange={(e) => onUpdate(param.name, e.target.value)}
                placeholder={`Enter ${param.name}`}
                required={param.required}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

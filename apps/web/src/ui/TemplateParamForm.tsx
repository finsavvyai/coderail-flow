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
    <div className="tpl-param-wrap">
      <label className="tpl-param-title">
        Template Parameters
      </label>
      <div className="tpl-param-box">
        {params.map((param) => (
          <div key={param.name} className="tpl-param-field">
            <label className="tpl-param-label">
              {param.name}
              {param.required && <span className="tpl-param-required"> *</span>}
              <span className="tpl-param-type">({param.type})</span>
            </label>
            {param.type === 'number' ? (
              <input
                className="input tpl-param-input"
                type="number"
                value={values[param.name] || ''}
                onChange={(e) => onUpdate(param.name, Number(e.target.value))}
                required={param.required}
              />
            ) : (
              <input
                className="input tpl-param-input"
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

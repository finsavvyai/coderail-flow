import { Lightbulb } from 'lucide-react';
import { STEP_TYPES } from './flow-builder-step-types';
import { StepIcon } from './step-icons';

interface AddStepPanelProps {
  onAddStep: (type: string) => void;
}

export function AddStepPanel({ onAddStep }: AddStepPanelProps) {
  return (
    <>
      <h2 className="h2" style={{ marginBottom: 16 }}>
        Add Step
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
        }}
      >
        {STEP_TYPES.map((type) => (
          <button
            key={type.value}
            className="btn"
            onClick={() => onAddStep(type.value)}
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
            }}
          >
            <StepIcon type={type.value} size={24} />
            <span style={{ fontSize: 13 }}>{type.label}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#1a1a1a',
          borderRadius: 8,
          border: '1px solid #2a2a2a',
        }}
      >
        <div className="small" style={{ color: '#a8b3cf', marginBottom: 8 }}>
          <Lightbulb size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Quick Tips
        </div>
        <ul style={{ fontSize: 13, color: '#a8b3cf', paddingLeft: 20, margin: 0 }}>
          <li>
            Use{' '}
            <code style={{ background: '#2a2a2a', padding: '2px 6px', borderRadius: 4 }}>goto</code>{' '}
            to navigate to pages
          </li>
          <li>
            Use{' '}
            <code style={{ background: '#2a2a2a', padding: '2px 6px', borderRadius: 4 }}>
              caption
            </code>{' '}
            to show explanatory text
          </li>
          <li>
            Use{' '}
            <code style={{ background: '#2a2a2a', padding: '2px 6px', borderRadius: 4 }}>
              highlight
            </code>{' '}
            to draw attention to elements
          </li>
          <li>
            Parameters: Use{' '}
            <code style={{ background: '#2a2a2a', padding: '2px 6px', borderRadius: 4 }}>
              {'{{paramName}}'}
            </code>{' '}
            in values
          </li>
        </ul>
      </div>
    </>
  );
}

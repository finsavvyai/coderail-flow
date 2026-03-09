import { ArrowLeft, Save, Play } from 'lucide-react';
import type { Flow } from './api';
import { STEP_TYPES } from './flow-builder-step-types';
import { useFlowBuilder } from './useFlowBuilder';
import { StepList } from './StepList';
import { StepFieldEditor } from './StepFieldEditor';
import { AddStepPanel } from './AddStepPanel';
import { FlowTestModal } from './FlowTestModal';
import { useState } from 'react';

export function FlowBuilder({
  projectId,
  existingFlow,
  onSave,
  onCancel,
}: {
  projectId: string;
  existingFlow?: Flow;
  onSave: (flow: Flow) => void;
  onCancel: () => void;
}) {
  const [showTestModal, setShowTestModal] = useState(false);

  const {
    name,
    setName,
    description,
    setDescription,
    definition,
    selectedStep,
    setSelectedStep,
    authProfiles,
    authProfileId,
    setAuthProfileId,
    saving,
    error,
    addStep,
    updateStep,
    deleteStep,
    moveStep,
    handleSave,
  } = useFlowBuilder({ projectId, existingFlow, onSave });

  const stepConfig =
    selectedStep !== null
      ? STEP_TYPES.find((t) => t.value === definition.steps[selectedStep]?.type)
      : null;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 16 }}>
      {/* Left: Flow Info + Step List */}
      <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <button className="btn" onClick={onCancel} aria-label="Go back" style={{ padding: '10px' }}>
              <ArrowLeft size={16} />
            </button>
            <div className="h2" style={{ margin: 0 }}>
              Flow Builder
            </div>
          </div>

          <label htmlFor="flow-name" className="sr-only">Flow name</label>
          <input
            id="flow-name"
            className="input"
            placeholder="Flow name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: 8 }}
            aria-label="Flow name"
          />
          <label htmlFor="flow-desc" className="sr-only">Description</label>
          <textarea
            id="flow-desc"
            className="input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{ marginBottom: 12, resize: 'vertical' }}
            aria-label="Flow description"
          />

          <label htmlFor="flow-auth" className="sr-only">Auth profile</label>
          <select
            id="flow-auth"
            className="input"
            value={authProfileId}
            onChange={(e) => setAuthProfileId(e.target.value)}
            style={{ marginBottom: 12 }}
            aria-label="Auth profile"
          >
            <option value="">No auth profile</option>
            {authProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>

          {error && (
            <div
              style={{
                padding: 10,
                background: '#2a1a1a',
                border: '1px solid #f44336',
                borderRadius: 6,
                color: '#fca5a5',
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn"
              onClick={() => setShowTestModal(true)}
              disabled={definition.steps.length === 0}
              style={{
                flex: 1,
                background: definition.steps.length === 0 ? '#2a2a2a' : '#22c55e',
              }}
            >
              <Play size={16} style={{ display: 'inline', marginRight: 6 }} />
              Test
            </button>
            <button className="btn" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
              <Save size={16} style={{ display: 'inline', marginRight: 6 }} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="card" style={{ flex: 1, overflow: 'auto' }}>
          <div className="h2" style={{ marginBottom: 12 }}>
            Steps ({definition.steps.length})
          </div>
          <StepList
            steps={definition.steps}
            selectedStep={selectedStep}
            onSelectStep={setSelectedStep}
            onDeleteStep={deleteStep}
          />
        </div>
      </div>

      {/* Right: Step Editor or Add Step */}
      <div className="card" style={{ flex: 1, overflow: 'auto' }}>
        {selectedStep !== null && stepConfig ? (
          <StepFieldEditor
            step={definition.steps[selectedStep]}
            stepConfig={stepConfig}
            stepIndex={selectedStep}
            totalSteps={definition.steps.length}
            onUpdate={(updates) => updateStep(selectedStep, updates)}
            onMoveUp={() => moveStep(selectedStep, 'up')}
            onMoveDown={() => moveStep(selectedStep, 'down')}
          />
        ) : (
          <AddStepPanel onAddStep={addStep} />
        )}
      </div>

      {/* Test Modal */}
      {showTestModal && (
        <FlowTestModal
          projectId={projectId}
          flowDefinition={definition}
          flowName={name || 'Untitled Flow'}
          authProfileId={authProfileId}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </div>
  );
}

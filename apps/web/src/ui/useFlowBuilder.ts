import { useEffect, useState } from 'react';
import { createFlow, updateFlow, getAuthProfiles, type AuthProfile, type Flow } from './api';
import type { Step, FlowDefinition } from './flow-builder-types';

export interface UseFlowBuilderOptions {
  projectId: string;
  existingFlow?: Flow;
  onSave: (flow: Flow) => void;
}

export function useFlowBuilder({ projectId, existingFlow, onSave }: UseFlowBuilderOptions) {
  const [name, setName] = useState(existingFlow?.name || '');
  const [description, setDescription] = useState(existingFlow?.description || '');
  const [definition, setDefinition] = useState<FlowDefinition>(
    existingFlow?.definition
      ? typeof existingFlow.definition === 'string'
        ? JSON.parse(existingFlow.definition)
        : existingFlow.definition
      : { params: [], steps: [] }
  );
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [authProfiles, setAuthProfiles] = useState<AuthProfile[]>([]);
  const [authProfileId, setAuthProfileId] = useState<string>(
    (existingFlow as any)?.auth_profile_id || ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuthProfiles();
  }, [projectId]);

  async function loadAuthProfiles() {
    try {
      const profiles = await getAuthProfiles(projectId);
      setAuthProfiles(profiles);
    } catch {
      setAuthProfiles([]);
    }
  }

  function addStep(type: string) {
    const newStep: Step = { type };
    setDefinition((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
    setSelectedStep(definition.steps.length);
  }

  function updateStep(index: number, updates: Partial<Step>) {
    setDefinition((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? { ...s, ...updates } : s)),
    }));
  }

  function deleteStep(index: number) {
    setDefinition((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
    setSelectedStep(null);
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === definition.steps.length - 1) return;

    const newSteps = [...definition.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];

    setDefinition((prev) => ({ ...prev, steps: newSteps }));
    setSelectedStep(targetIndex);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Flow name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const flowData = {
        projectId,
        name: name.trim(),
        description: description.trim(),
        authProfileId: authProfileId || undefined,
        definition,
      };

      let savedFlow: Flow;
      if (existingFlow) {
        savedFlow = await updateFlow(existingFlow.id, flowData);
      } else {
        savedFlow = await createFlow(flowData);
      }

      onSave(savedFlow);
    } catch (e: any) {
      setError(e.message || 'Failed to save flow');
    } finally {
      setSaving(false);
    }
  }

  return {
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
  };
}

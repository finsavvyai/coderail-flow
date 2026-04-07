import { useEffect, useState } from 'react';
import { createFlow, updateFlow, getAuthProfiles } from './api';
export function useFlowBuilder({ projectId, existingFlow, onSave }) {
    const [name, setName] = useState(existingFlow?.name || '');
    const [description, setDescription] = useState(existingFlow?.description || '');
    const [definition, setDefinition] = useState(existingFlow?.definition
        ? typeof existingFlow.definition === 'string'
            ? JSON.parse(existingFlow.definition)
            : existingFlow.definition
        : { params: [], steps: [] });
    const [selectedStep, setSelectedStep] = useState(null);
    const [authProfiles, setAuthProfiles] = useState([]);
    const [authProfileId, setAuthProfileId] = useState(existingFlow?.auth_profile_id || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        void loadAuthProfiles();
    }, [projectId]);
    async function loadAuthProfiles() {
        try {
            const profiles = await getAuthProfiles(projectId);
            setAuthProfiles(profiles);
        }
        catch {
            setAuthProfiles([]);
        }
    }
    function addStep(type) {
        const newStep = { type };
        setDefinition((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
        setSelectedStep(definition.steps.length);
    }
    function updateStep(index, updates) {
        setDefinition((prev) => ({
            ...prev,
            steps: prev.steps.map((s, i) => (i === index ? { ...s, ...updates } : s)),
        }));
    }
    function deleteStep(index) {
        setDefinition((prev) => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index),
        }));
        setSelectedStep(null);
    }
    function moveStep(index, direction) {
        if (direction === 'up' && index === 0)
            return;
        if (direction === 'down' && index === definition.steps.length - 1)
            return;
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
            let savedFlow;
            if (existingFlow) {
                savedFlow = await updateFlow(existingFlow.id, flowData);
            }
            else {
                savedFlow = await createFlow(flowData);
            }
            onSave(savedFlow);
        }
        catch (e) {
            setError(e.message || 'Failed to save flow');
        }
        finally {
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

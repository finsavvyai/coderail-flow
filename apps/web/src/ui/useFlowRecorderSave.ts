import { useCallback } from 'react';
import type { RecordedAction, FlowStep } from './FlowRecorder.types';
import { convertToFlowSteps } from './FlowRecorder.utils';

export function useHandleSave(
  flowName: string,
  isRecording: boolean,
  recordedActions: RecordedAction[],
  stopRecording: () => Promise<RecordedAction[]>,
  onSaveFlow: (steps: FlowStep[], name: string) => void,
  setError: (v: string | null) => void
) {
  return useCallback(async () => {
    if (!flowName.trim()) {
      setError('Please enter a flow name');
      return;
    }

    const finalActions = isRecording ? await stopRecording() : recordedActions;
    if (finalActions.length === 0) {
      setError('No actions recorded');
      return;
    }

    onSaveFlow(convertToFlowSteps(finalActions), flowName.trim());
  }, [flowName, isRecording, onSaveFlow, recordedActions, stopRecording, setError]);
}

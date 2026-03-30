import { Save } from 'lucide-react';
import type { FlowRecorderProps } from './FlowRecorder.types';
import { RECORDER_STYLES } from './FlowRecorder.types';
import { useFlowRecorder } from './useFlowRecorder';
import { RecorderUrlInput } from './RecorderUrlInput';
import { RecorderPreview } from './RecorderPreview';
import { RecorderStepList } from './RecorderStepList';

export type { FlowStep, RecordedAction } from './FlowRecorder.types';

export function FlowRecorder({ onSaveFlow, onCancel }: FlowRecorderProps) {
  const recorder = useFlowRecorder(onSaveFlow);

  return (
    <div className="recorder-layout">
      {/* Header */}
      <div className="recorder-header">
        <div className="h2 recorder-title">
          Flow Recorder
          {recorder.isRecording && (
            <span className="recorder-rec-badge">REC</span>
          )}
        </div>
        <div className="recorder-actions">
          <button className="btn recorder-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn recorder-btn-save ${recorder.recordedActions.length > 0 ? 'recorder-btn-save--active' : 'recorder-btn-save--disabled'}`}
            onClick={recorder.handleSave}
            disabled={recorder.recordedActions.length === 0}
          >
            <Save size={14} /> Save Flow
          </button>
        </div>
      </div>

      {recorder.error && (
        <div className="recorder-error">
          {recorder.error}
        </div>
      )}

      <RecorderUrlInput
        targetUrl={recorder.targetUrl}
        setTargetUrl={recorder.setTargetUrl}
        isRecording={recorder.isRecording}
        flowName={recorder.flowName}
        setFlowName={recorder.setFlowName}
        mode={recorder.mode}
        availableModes={recorder.availableModes}
        cycleMode={recorder.cycleRecorderMode}
        modeStatusMessage={recorder.recorderStatusMessage}
        favoriteUrls={recorder.favoriteUrls}
        recentUrls={recorder.recentUrls}
        showUrlDropdown={recorder.showUrlDropdown}
        setShowUrlDropdown={recorder.setShowUrlDropdown}
        urlDropdownRef={recorder.urlDropdownRef}
        startRecording={recorder.startRecording}
        stopRecording={recorder.stopRecording}
        onToggleFavorite={recorder.handleToggleFavorite}
        onRemoveFavorite={recorder.handleRemoveFavorite}
        onRemoveRecent={recorder.handleRemoveRecent}
      />

      {/* Main Content */}
      <div className="recorder-main">
        <RecorderPreview
          targetUrl={recorder.targetUrl}
          isRecording={recorder.isRecording}
          mode={recorder.mode}
          iframeRef={recorder.iframeRef}
          iframeLoaded={recorder.iframeLoaded}
          showSubtitleOverlay={recorder.showSubtitleOverlay}
          activeStepIndex={recorder.activeStepIndex}
          recordedActions={recorder.recordedActions}
          onPopOut={recorder.popOutToWindow}
          serverScreenshot={recorder.serverScreenshot}
        />
        <RecorderStepList
          recordedActions={recorder.recordedActions}
          activeStepIndex={recorder.activeStepIndex}
          setActiveStepIndex={recorder.setActiveStepIndex}
          showSubtitleOverlay={recorder.showSubtitleOverlay}
          setShowSubtitleOverlay={recorder.setShowSubtitleOverlay}
          onRemoveAction={recorder.removeAction}
          onUpdateSubtitle={recorder.updateSubtitle}
          onClear={recorder.clearActions}
          onAddManual={recorder.addManualAction}
        />
      </div>

      <style>{RECORDER_STYLES}</style>
    </div>
  );
}

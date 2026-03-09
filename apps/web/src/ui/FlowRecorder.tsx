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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="h2" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          Flow Recorder
          {recorder.isRecording && (
            <span
              style={{
                background: '#ef4444',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 12,
                animation: 'pulse 1s infinite',
              }}
            >
              REC
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={onCancel} style={{ background: '#2a2a2a' }}>
            Cancel
          </button>
          <button
            className="btn"
            onClick={recorder.handleSave}
            disabled={recorder.recordedActions.length === 0}
            style={{ background: recorder.recordedActions.length > 0 ? '#22c55e' : '#2a2a2a' }}
          >
            <Save size={14} /> Save Flow
          </button>
        </div>
      </div>

      {recorder.error && (
        <div style={{ background: '#7f1d1d', padding: 12, borderRadius: 8, fontSize: 13 }}>
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
        setMode={recorder.setMode}
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
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
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

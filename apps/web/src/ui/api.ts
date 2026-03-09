// Barrel re-export — all consumers keep importing from "./api"
export type {
  Flow,
  TemplateSummary,
  RunRow,
  AnalyticsStats,
  StepAnalyticsStats,
  ElementReliabilityStats,
  AuthProfile,
} from './api-types';

export { setTokenProvider, apiRequest } from './api-core';

export {
  getFlows,
  createFlow,
  updateFlow,
  getTemplates,
  createFlowFromTemplate,
  getAuthProfiles,
} from './api-flows';

export {
  createRun,
  getRuns,
  getRun,
  retryRun,
  artifactDownloadUrl,
  fetchArtifactBlobUrl,
  fetchArtifactText,
} from './api-runs';

export { getAnalyticsStats, getStepAnalytics, getElementReliability } from './api-analytics';

export {
  getProjects,
  createProject,
  getScreens,
  createScreen,
  getElements,
  createElement,
} from './api-projects';

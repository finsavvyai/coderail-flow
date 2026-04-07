import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import { SessionProvider } from '@hono/auth-js/react';
import { AppErrorBoundary } from './ui/AppErrorBoundary';
import { DeploymentConfigPage } from './ui/DeploymentConfigPage';
import { NotFoundPage } from './ui/NotFoundPage';
import { ToastContainer } from './ui/ToastContainer';
import { configureAuthClient } from './ui/auth-client';
import { getWebRuntimeConfig } from './ui/runtime-config';
import './ui/styles.css';
import './ui/landing.css';
import './ui/landing-features.css';
import './ui/landing-pricing.css';
import './ui/landing-cta.css';
import './ui/landing-footer.css';
import './ui/dashboard.css';
import './ui/dashboard-cards.css';
import './ui/dashboard-states.css';
import './ui/dashboard-onboarding.css';
import './ui/dashboard-responsive.css';
import './ui/recorder-preview.css';
import './ui/recorder-input.css';
import './ui/recorder-url.css';
import './ui/onboarding-parts.css';
import './ui/onboarding-welcome.css';
import './ui/analytics.css';
import './ui/schedule.css';
import './ui/templates.css';
import './ui/modal.css';
import './ui/billing.css';
import './ui/project.css';
import './ui/project-screens.css';
import './ui/steps.css';
import './ui/api-keys.css';
import './ui/misc.css';
import './ui/notfound-skeleton.css';
import './ui/preview-misc.css';
import './ui/media.css';
import './ui/media-ext.css';
import './ui/integrations.css';
import './ui/integrations-ext.css';
import './ui/inspector.css';
import './ui/inspector-ext.css';
import './ui/flows.css';
import './ui/flows-ext.css';
import './ui/runs.css';
import './ui/runs-ext.css';
import './ui/app-shell.css';
import './ui/app-shell-ext.css';
import './ui/analytics-ext.css';
import './ui/last-fixes.css';
import './ui/recorder-steplist.css';

const runtimeConfig = getWebRuntimeConfig(import.meta.env);
configureAuthClient();
const LandingPage = lazy(() =>
  import('./ui/LandingPage').then((module) => ({ default: module.LandingPage }))
);
const ProtectedRoute = lazy(() =>
  import('./ui/ProtectedRoute').then((module) => ({ default: module.ProtectedRoute }))
);
const BillingPage = lazy(() =>
  import('./ui/BillingPage').then((module) => ({ default: module.BillingPage }))
);
const ProjectManager = lazy(() =>
  import('./ui/ProjectManager').then((module) => ({ default: module.ProjectManager }))
);
const App = lazy(() => import('./ui/App').then((module) => ({ default: module.App })));
const DashboardPage = lazy(() => import('./ui/DashboardPage'));

function RouteFallback() {
  return (
    <div className="route-fallback">
      <div className="card route-fallback-card">Loading workspace...</div>
    </div>
  );
}

function routeElement(element: React.ReactNode) {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<RouteFallback />}>{element}</Suspense>
    </AppErrorBoundary>
  );
}

function ProtectedAppUnavailable() {
  return (
    <DeploymentConfigPage
      title="The protected app is not configured for this deployment."
      body="Protected routes stay unavailable until the production API origin is configured for this deployment."
      issues={runtimeConfig.issues}
      actions={
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/">
            Back to Landing Page
          </Link>
        </div>
      }
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastContainer />
    {runtimeConfig.authReady && runtimeConfig.apiReady ? (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={routeElement(<LandingPage />)} />
            <Route
              path="/app"
              element={routeElement(
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/app/dashboard"
              element={routeElement(
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/app/flows"
              element={routeElement(
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/app/runs/:runId"
              element={routeElement(
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/billing"
              element={routeElement(
                <ProtectedRoute>
                  <BillingPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/projects"
              element={routeElement(
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              )}
            />
            <Route path="*" element={routeElement(<NotFoundPage />)} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    ) : runtimeConfig.allowDevelopmentFallback ? (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={routeElement(<LandingPage />)} />
          <Route path="/app" element={routeElement(<DashboardPage />)} />
          <Route path="/app/dashboard" element={routeElement(<DashboardPage />)} />
          <Route path="/app/flows" element={routeElement(<App />)} />
          <Route path="/app/runs/:runId" element={routeElement(<App />)} />
          <Route path="/billing" element={routeElement(<BillingPage />)} />
          <Route path="/projects" element={routeElement(<ProjectManager />)} />
          <Route path="*" element={routeElement(<NotFoundPage />)} />
        </Routes>
      </BrowserRouter>
    ) : (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={routeElement(<LandingPage />)} />
          <Route path="/app" element={routeElement(<ProtectedAppUnavailable />)} />
          <Route path="/app/dashboard" element={routeElement(<ProtectedAppUnavailable />)} />
          <Route path="/app/flows" element={routeElement(<ProtectedAppUnavailable />)} />
          <Route path="/app/runs/:runId" element={routeElement(<ProtectedAppUnavailable />)} />
          <Route path="/billing" element={routeElement(<ProtectedAppUnavailable />)} />
          <Route path="/projects" element={routeElement(<ProtectedAppUnavailable />)} />
          <Route path="*" element={routeElement(<NotFoundPage />)} />
        </Routes>
      </BrowserRouter>
    )}
  </React.StrictMode>
);

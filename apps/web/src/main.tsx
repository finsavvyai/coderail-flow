import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AppErrorBoundary } from './ui/AppErrorBoundary';
import { DeploymentConfigPage } from './ui/DeploymentConfigPage';
import { NotFoundPage } from './ui/NotFoundPage';
import { ToastContainer } from './ui/ToastContainer';
import { getWebRuntimeConfig } from './ui/runtime-config';
import './ui/styles.css';
import './ui/landing.css';
import './ui/dashboard.css';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const runtimeConfig = getWebRuntimeConfig(import.meta.env);
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07111f',
        color: '#d6deeb',
      }}
    >
      <div
        className="card"
        style={{
          minWidth: 220,
          textAlign: 'center',
        }}
      >
        Loading workspace...
      </div>
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
      body="Protected routes stay unavailable until both the production API URL and Clerk publishable key are configured."
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
      <ClerkProvider publishableKey={clerkKey}>
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
      </ClerkProvider>
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

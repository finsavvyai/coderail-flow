import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./ui/App";
import { LandingPage } from "./ui/LandingPage";
import { ProtectedRoute } from "./ui/ProtectedRoute";
import { BillingPage } from "./ui/BillingPage";
import "./ui/styles.css";
import "./ui/landing.css";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {clerkKey ? (
      <ClerkProvider publishableKey={clerkKey}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<App />} />
          <Route path="/billing" element={<BillingPage />} />
        </Routes>
      </BrowserRouter>
    )}
  </React.StrictMode>
);

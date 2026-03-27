/**
 * Integrations barrel — re-exports public API from split modules.
 *
 * Consumers should import from this file to preserve existing import paths.
 * Internal modules:
 *   integration_types.ts   — shared types, encryption helpers
 *   webhook_delivery.ts    — delivery orchestration + HTTP post helper
 *   providers_notify.ts    — Slack, generic webhook providers
 *   providers_scm.ts       — GitHub, GitLab, Jira providers
 *   integration_routes.ts  — Hono CRUD routes for integrations
 *   api_keys.ts            — API key routes + auth middleware
 */

export { deliverWebhooks } from './webhook_delivery';
export { integrationRoutes } from './integration_routes';
export { apiKeyRoutes, apiKeyAuth } from './api_keys';

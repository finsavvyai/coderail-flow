/** Auth-wrapped sub-app route mounting. */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { Variables } from '../index';
import { requireAuth } from '../auth';
import { integrationRoutes, apiKeyRoutes, apiKeyAuth } from '../integrations';
import { triggerRoutes } from '../triggers';
import { ssoRoutes } from '../security/sso';
import { complianceRoutes } from '../security/compliance';

export function mountAuthWrappedRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  const auth = requireAuth();

  app.route(
    '/integrations',
    (() => {
      const r = new Hono<{ Bindings: Env; Variables: Variables }>();
      r.use('*', auth);
      r.route('/', integrationRoutes());
      return r;
    })()
  );

  app.route(
    '/api-keys',
    (() => {
      const r = new Hono<{ Bindings: Env; Variables: Variables }>();
      r.use('*', auth);
      r.route('/', apiKeyRoutes());
      return r;
    })()
  );

  app.route('/sso', ssoRoutes());

  app.route(
    '/compliance',
    (() => {
      const r = new Hono<{ Bindings: Env; Variables: Variables }>();
      r.use('*', auth);
      r.route('/', complianceRoutes());
      return r;
    })()
  );

  app.route(
    '/triggers',
    (() => {
      const r = new Hono<{ Bindings: Env; Variables: Variables }>();
      r.use('*', apiKeyAuth());
      r.use('*', auth);
      r.route('/', triggerRoutes());
      return r;
    })()
  );
}

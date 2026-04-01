import { MiddlewareHandler } from 'hono';
import type { Env } from './env';
import { isProductionLikeEnv } from './runtime-config';
import { verifyApiToken } from './auth-token';

type AuthVariables = { userId: string; userEmail?: string };

/**
 * Hono middleware: require a valid signed API token.
 * Sets `userId` on context variables.
 * Skips auth only when AUTH_SECRET is intentionally omitted in local/test mode.
 */
export function requireAuth(): MiddlewareHandler<{ Bindings: Env; Variables: AuthVariables }> {
  return async (c, next) => {
    const env = c.env;

    if (!env.AUTH_SECRET) {
      if (isProductionLikeEnv(env.APP_ENV)) {
        return c.json(
          {
            error: 'service_unavailable',
            message: 'Authentication is not configured for this environment.',
          },
          503
        );
      }

      c.set('userId', 'dev-user');
      return next();
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        { error: 'unauthorized', message: 'Missing or invalid Authorization header' },
        401
      );
    }

    const token = authHeader.slice(7);

    try {
      const claims = await verifyApiToken(token, env.AUTH_SECRET);
      c.set('userId', claims.sub);
      if (claims.email) c.set('userEmail', claims.email);
    } catch (err: any) {
      return c.json({ error: 'unauthorized', message: err.message }, 401);
    }

    return next();
  };
}

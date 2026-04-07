import { MiddlewareHandler } from 'hono';
import type { Env } from './env';
import { isProductionLikeEnv } from './runtime-config';
import { verifyApiToken } from './auth-token';

type AuthContextVariables = {
  userId?: string;
  userEmail?: string;
  [key: string]: unknown;
};

/**
 * Hono middleware: require a valid signed API token.
 * Sets `userId` on context variables.
 * Skips auth only when AUTH_SECRET is intentionally omitted in local/test mode.
 */
export function requireAuth<
  V extends AuthContextVariables = AuthContextVariables,
>(): MiddlewareHandler<{
  Bindings: Env;
  Variables: V;
}> {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid token';
      return c.json({ error: 'unauthorized', message }, 401);
    }

    return next();
  };
}

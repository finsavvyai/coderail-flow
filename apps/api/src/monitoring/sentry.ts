/**
 * Sentry error monitoring integration for Cloudflare Workers.
 */

import * as Sentry from '@sentry/cloudflare';
import type { CloudflareOptions } from '@sentry/cloudflare';

export interface SentryEnv {
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  SENTRY_RELEASE?: string;
  APP_ENV?: string;
}

/**
 * Build Sentry options for the Cloudflare Worker wrapper.
 */
export function getSentryOptions(env: SentryEnv): CloudflareOptions | undefined {
  if (!env.SENTRY_DSN) {
    return undefined;
  }

  return {
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || env.APP_ENV || 'production',
    release: env.SENTRY_RELEASE || 'coderail-flow@1.0.0',
    tracesSampleRate: 0.1, // 10% of transactions
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      return event;
    },
  };
}

/**
 * Backward-compatible no-op. Cloudflare Workers are initialized via Sentry.withSentry().
 */
export function initSentry(_env: SentryEnv): void {}

function isSentryReady(): boolean {
  return Sentry.isInitialized();
}

/**
 * Capture an exception and send to Sentry.
 */
export function captureException(
  err: Error,
  context?: { user?: { id: string }; [key: string]: any }
): void {
  if (!isSentryReady()) return;

  Sentry.captureException(err, {
    user: context?.user ? { id: context.user.id } : undefined,
    extra: context,
  });
}

/**
 * Capture a message and send to Sentry.
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (!isSentryReady()) return;

  Sentry.captureMessage(message, level);
}

/**
 * Flush pending events before worker terminates.
 */
export async function flushSentry(): Promise<void> {
  if (!isSentryReady()) return;

  await Sentry.flush(2000); // Wait up to 2 seconds
}

/**
 * Wrap a handler with Sentry error tracking.
 */
export function withSentry<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  getContext?: (args: Parameters<T>[0]) => { userId?: string; [key: string]: any }
): T {
  return (async (c: any, ...rest: any[]) => {
    try {
      return await handler(c, ...rest);
    } catch (err: any) {
      const context = getContext?.(c);
      captureException(err, context);

      // Return generic error to client
      return c.json(
        {
          error: 'internal_error',
          message: 'An unexpected error occurred. Please try again later.',
          requestId: crypto.randomUUID(),
        },
        500
      );
    }
  }) as T;
}

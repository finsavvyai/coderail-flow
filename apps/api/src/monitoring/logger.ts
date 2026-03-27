/**
 * Structured logging for Cloudflare Workers.
 *
 * Provides JSON-formatted logging with levels and context.
 * Compatible with Cloudflare Workers' console output.
 */

import type { MiddlewareHandler } from 'hono';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  userId?: string;
  requestId?: string;
}

class Logger {
  private readonly requestId: string;

  constructor(requestId?: string) {
    this.requestId = requestId || crypto.randomUUID();
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
    };

    if (context) {
      entry.context = this.sanitizeContext(context);
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Output as JSON for parsing
    const json = JSON.stringify(entry);

    switch (level) {
      case 'debug':
        console.debug(json);
        break;
      case 'info':
        console.info(json);
        break;
      case 'warn':
        console.warn(json);
        break;
      case 'error':
        console.error(json);
        break;
    }
  }

  /**
   * Sanitize context to remove sensitive data.
   */
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization', 'cookie'];

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeContext(sanitized[key]);
      }
    }

    return sanitized;
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  /**
   * Create a child logger with additional context.
   */
  child(additionalContext: Record<string, any>): Logger {
    const child = new Logger(this.requestId);
    const originalLog = child.log.bind(child);
    child.log = (level, message, context, error) => {
      const mergedContext = { ...additionalContext, ...context };
      originalLog(level, message, mergedContext, error);
    };
    return child;
  }
}

/**
 * Get a logger instance for the current request.
 */
export function getLogger(requestId?: string): Logger {
  return new Logger(requestId);
}

/**
 * Middleware to inject logger into context.
 */
export function loggerMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = c.req.header('x-request-id') || crypto.randomUUID();
    const logger = getLogger(requestId);

    c.set('requestId', requestId as never);
    c.set('logger', logger as never);

    const start = Date.now();
    try {
      await next();
    } finally {
      const duration = Date.now() - start;
      c.header('X-Request-Id', requestId);
      c.header('Server-Timing', `app;dur=${duration}`);
      logger.info(`${c.req.method} ${c.req.path}`, {
        status: c.res.status || 500,
        duration: `${duration}ms`,
        method: c.req.method,
        path: c.req.path,
        userId: c.get('userId'),
      });
    }
  };
}

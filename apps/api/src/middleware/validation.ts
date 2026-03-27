/**
 * Validation error middleware.
 *
 * Catches Zod validation errors and returns proper 400 responses.
 */

import type { MiddlewareHandler } from 'hono';
import { ZodError } from 'zod';

export const validationErrorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json(
        {
          error: 'validation_error',
          message: 'Request validation failed',
          details: err.errors,
        },
        400
      );
    }
    throw err; // Re-throw other errors
  }
};

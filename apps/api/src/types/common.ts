/**
 * Common type definitions.
 */

export type JsonObject = Record<string, unknown>;
export type JsonArray = unknown[];
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

export interface DatabaseResult {
  results?: unknown[];
  meta?: {
    duration?: number;
    rows_read?: number;
    rows_written?: number;
    last_row_id?: number;
    changes?: number;
  };
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ExecutionOptions {
  timeout?: number;
  retries?: number;
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ValidationErrorResponse {
  error: 'validation_error';
  message: string;
  details: Array<{
    path: (string | number)[];
    message: string;
    code: string;
  }>;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: JsonValue;
  requestId?: string;
}

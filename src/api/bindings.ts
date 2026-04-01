export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  AUTH_SECRET: string;
  ENVIRONMENT: "production" | "development" | "test";
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
}

export type CloudflareBindings = Env;

export interface RequestContext {
  env: Env;
  userId?: string;
  requestId: string;
  startTime: number;
}

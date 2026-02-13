export interface Env {
  DB: D1Database;
  ARTIFACTS: R2Bucket;
  BROWSER: Fetcher;
  APP_ENV: string;
  PUBLIC_BASE_URL: string;
  CLERK_ISSUER?: string;
  LEMONSQUEEZY_API_KEY?: string;
  LEMONSQUEEZY_WEBHOOK_SECRET?: string;
  LEMONSQUEEZY_STORE_ID?: string;
  LEMONSQUEEZY_VARIANT_PRO?: string;
  LEMONSQUEEZY_VARIANT_TEAM?: string;
}

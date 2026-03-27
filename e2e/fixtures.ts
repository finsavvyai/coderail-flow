import { test as base, type Page } from "@playwright/test";

export const API_BASE_URL = process.env.E2E_API_URL ?? "http://localhost:8787";
export const WEB_BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";

/** Skip a test if an env var is not set */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required for this test. Set it or skip the test.`);
  }
  return value;
}

export function skipIfNoCredentials(testFn: () => void) {
  if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
    return;
  }
  testFn();
}

type Fixtures = {
  apiBaseUrl: string;
  webBaseUrl: string;
};

export const test = base.extend<Fixtures>({
  apiBaseUrl: async ({}, use) => {
    await use(API_BASE_URL);
  },
  webBaseUrl: async ({}, use) => {
    await use(WEB_BASE_URL);
  },
});

export { expect } from "@playwright/test";

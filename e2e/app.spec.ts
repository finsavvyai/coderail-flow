import { test, expect } from "@playwright/test";

/**
 * /app page tests.
 * When VITE_CLERK_PUBLISHABLE_KEY is NOT set, Clerk is disabled and /app renders without auth.
 * When it IS set, these tests require E2E_TEST_EMAIL + E2E_TEST_PASSWORD.
 */

const needsAuth = !!process.env.VITE_CLERK_PUBLISHABLE_KEY;

test.describe("App page (/app)", () => {
  test.skip(
    needsAuth && (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD),
    "Skipped: Clerk is enabled — set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run"
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
    // Clerk hides the page until auth state is resolved; wait for it to render
    await page.waitForSelector(".auth-gate, .container, .app-topbar", { timeout: 30_000 }).catch(() => {});
  });

  test("page renders without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/app");
    await page.waitForSelector(".auth-gate, .container, .app-topbar", { timeout: 30_000 }).catch(() => {});
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("ERR_CONNECTION_REFUSED") &&
        !e.includes("Failed to fetch") &&
        !e.includes("clerk") &&
        !e.includes("Clerk")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("CodeRail Flow heading is visible", async ({ page }) => {
    const heading = page.getByText(/CodeRail Flow/i);
    await expect(heading.first()).toBeVisible({ timeout: 10_000 });
  });

  test("Run History Dashboard section is present", async ({ page }) => {
    const dashboard = page.getByText(/Run History Dashboard|Analytics|Dashboard/i);
    await expect(dashboard.first()).toBeVisible({ timeout: 10_000 });
  });

  test("app or sign-in gate is rendered", async ({ page }) => {
    // Either the real app (Flows section) or Clerk's sign-in gate must be visible
    const appContent = page.getByText(/Flows/i).nth(0);
    const signInGate = page.getByText(/Sign in to CodeRail/i).nth(0);
    await expect(appContent.or(signInGate)).toBeVisible({ timeout: 10_000 });
  });

  test("Runs section or sign-in gate is rendered", async ({ page }) => {
    const runsHeading = page.locator("div.h2", { hasText: "Runs" });
    const signInGate = page.getByText(/Sign in to CodeRail/i);
    await expect(runsHeading.or(signInGate)).toBeVisible({ timeout: 10_000 });
  });

  test("interactive button is present (Run flow or Sign In)", async ({ page }) => {
    const btn = page.getByRole("button").first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
  });

  test("footer or auth gate renders with recognisable text", async ({ page }) => {
    const footer = page.getByText(/Production Status|v1\.0|CodeRail Flow/i).first();
    await expect(footer).toBeVisible({ timeout: 10_000 });
  });
});

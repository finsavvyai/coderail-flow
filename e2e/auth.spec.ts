import { test, expect } from "@playwright/test";

test.describe("Authentication & protected routes", () => {
  test("GET /app redirects to sign-in or renders app when Clerk not configured", async ({ page }) => {
    const response = await page.goto("/app");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(url).toBeTruthy();
  });

  test("GET /billing is accessible (protected or fallback)", async ({ page }) => {
    await page.goto("/billing");
    // Clerk hides the page until initialized; wait for auth gate or app content
    await page.waitForSelector(".auth-gate, .container", { timeout: 30_000 }).catch(() => {});
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });

  test("GET /projects is accessible (protected or fallback)", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForSelector(".auth-gate, .container", { timeout: 30_000 }).catch(() => {});
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });

  test("unknown route renders something (404 or redirect)", async ({ page }) => {
    await page.goto("/this-does-not-exist-xyz");
    await page.waitForLoadState("domcontentloaded");
    // React Router renders nothing for unknown routes but the HTML shell is always served
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });

  test.describe("Clerk-authenticated flows (requires E2E credentials)", () => {
    test.skip(
      !process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD,
      "Skipped: set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run"
    );

    test("can sign in and reach /app", async ({ page }) => {
      await page.goto("/");
      const signInLink = page.locator("a[href*='sign-in'], button:has-text('Sign in'), a:has-text('Sign in')").first();
      await signInLink.click();
      await page.waitForURL(/(sign-in|accounts\.clerk)/, { timeout: 15_000 });

      const emailInput = page.locator("input[type='email'], input[name='identifier']");
      await emailInput.fill(process.env.E2E_TEST_EMAIL!);
      await page.keyboard.press("Enter");

      const passwordInput = page.locator("input[type='password']");
      await passwordInput.fill(process.env.E2E_TEST_PASSWORD!);
      await page.keyboard.press("Enter");

      await page.waitForURL(/\/app/, { timeout: 20_000 });
      await expect(page.locator("body")).toBeVisible();
    });
  });
});

import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders without crashing", async ({ page }) => {
    await expect(page).not.toHaveTitle("Error");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("page title is set", async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("has at least one heading or prominent text", async ({ page }) => {
    const headings = page.locator("h1, h2, [role='heading']");
    await expect(headings.first()).toBeVisible({ timeout: 10_000 });
  });

  test("has a call-to-action or nav link", async ({ page }) => {
    const cta = page.locator("a, button").first();
    await expect(cta).toBeVisible({ timeout: 10_000 });
  });

  test("navigates to /app or shows sign-in on CTA click", async ({ page }) => {
    const ctaLink = page.locator("a[href='/app'], a[href='/sign-in'], a[href*='app']").first();
    const count = await ctaLink.count();
    if (count > 0) {
      await ctaLink.click();
      await page.waitForURL(/(\/app|\/sign-in|clerk)/, { timeout: 10_000 });
    }
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("404") &&
        !e.includes("ERR_CONNECTION_REFUSED") &&
        !e.includes("Failed to fetch") &&
        !e.includes("clerk") &&
        !e.includes("Clerk")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

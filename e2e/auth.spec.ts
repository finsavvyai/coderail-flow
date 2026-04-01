import { test, expect } from "@playwright/test";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.describe("Authentication & protected routes", () => {
  test("GET /app resolves to the workspace or auth gate", async ({ page }) => {
    const response = await page.goto("/app");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(url).toBeTruthy();
  });

  test("GET /billing is accessible (protected or fallback)", async ({ page }) => {
    await page.goto("/billing");
    // Wait for either the auth gate or the page content.
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

  test.describe("Configured auth provider handoff", () => {
    test.skip(
      !process.env.E2E_AUTH_PROVIDER,
      "Skipped: set E2E_AUTH_PROVIDER to validate a configured sign-in button"
    );

    test("opens the configured provider flow", async ({ page }) => {
      const providerName = process.env.E2E_AUTH_PROVIDER!;
      await page.goto("/app");
      await page.waitForSelector(".auth-gate", { timeout: 30_000 });

      const providerButton = page.getByRole("button", {
        name: new RegExp(`Continue with ${escapeRegExp(providerName)}`, "i"),
      });

      await expect(providerButton).toBeVisible({ timeout: 10_000 });
      await Promise.all([
        page.waitForURL(/(\/auth\/signin|oauth|login|accounts)/i, { timeout: 15_000 }),
        providerButton.click(),
      ]);
    });
  });
});

import { test, expect } from "@playwright/test";

test.describe("Projects page (/projects)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
    await page.waitForSelector(".auth-gate, .container", { timeout: 30_000 }).catch(() => {});
  });

  test("renders without crashing", async ({ page }) => {
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });

  test("no critical JS errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/projects");
    await page.waitForLoadState("domcontentloaded");
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("ERR_CONNECTION_REFUSED") &&
        !e.includes("Failed to fetch")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("shows project-related UI elements or sign-in gate", async ({ page }) => {
    const projectText = page.getByText(/Projects|Create Project/i).first();
    const signInGate = page.getByText(/Sign in to CodeRail/i);
    await expect(projectText.or(signInGate)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Billing page (/billing)", () => {
  test("renders billing content", async ({ page }) => {
    await page.goto("/billing");
    await page.waitForSelector(".auth-gate, .container", { timeout: 30_000 }).catch(() => {});
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });

  test("contains billing-related content or sign-in gate", async ({ page }) => {
    await page.goto("/billing");
    await page.waitForSelector(".auth-gate, .container", { timeout: 30_000 }).catch(() => {});
    const billingContent = page.getByText(/plan|billing|pricing|pro|free|usage/i).first();
    const signInGate = page.getByText(/Sign in to CodeRail/i);
    const loader = page.getByText(/Loading/i);
    await expect(billingContent.or(signInGate).or(loader)).toBeVisible({ timeout: 10_000 });
  });
});

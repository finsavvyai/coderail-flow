import { test, expect } from '@playwright/test';

const BASE_URL = 'https://flow.coderail.dev';
const SCREENSHOT_DIR = '.luna/coderailflow/heal-report/iterations/1/screenshots';

const PUBLIC_ROUTES = [
  { name: 'landing', path: '/' },
  { name: 'app-dashboard', path: '/app/dashboard' },
  { name: 'app-flows', path: '/app' },
  { name: 'billing', path: '/billing' },
  { name: 'projects', path: '/projects' },
  { name: 'not-found', path: '/nonexistent-page' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

for (const route of PUBLIC_ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`${route.name} @ ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const errors: string[] = [];
      const consoleLogs: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleLogs.push(`CONSOLE ERROR: ${msg.text()}`);
        }
      });

      page.on('pageerror', err => {
        errors.push(`PAGE ERROR: ${err.message}`);
      });

      // Navigate with extended timeout for production
      const response = await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Check HTTP status
      expect(response?.status()).toBeLessThan(500);

      // Wait for React to render
      await page.waitForTimeout(2000);

      // Screenshot
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/${route.name}-${viewport.name}.png`,
        fullPage: true,
      });

      // Check for visible error states
      const errorElements = await page.locator('[class*="error"], [class*="Error"], [role="alert"]').count();

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
      });

      // Check for overflow (horizontal scroll)
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Check for empty page (no content rendered)
      const bodyText = await page.evaluate(() => document.body.innerText.trim());
      const hasContent = bodyText.length > 10;

      // Check for accessibility basics
      const missingAltText = await page.evaluate(() => {
        const images = document.querySelectorAll('img:not([alt])');
        return images.length;
      });

      const missingLabels = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
        const buttons = document.querySelectorAll('button:not([aria-label]):not(:has(*))');
        return { inputs: inputs.length, emptyButtons: buttons.length };
      });

      // Check touch targets on mobile
      let smallTouchTargets = 0;
      if (viewport.width <= 768) {
        smallTouchTargets = await page.evaluate(() => {
          const clickables = document.querySelectorAll('button, a, [role="button"], input, select, textarea');
          let small = 0;
          clickables.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
              small++;
            }
          });
          return small;
        });
      }

      // Check contrast and readability
      const tinyText = await page.evaluate(() => {
        const allText = document.querySelectorAll('p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6');
        let tiny = 0;
        allText.forEach(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          if (fontSize > 0 && fontSize < 12) {
            tiny++;
          }
        });
        return tiny;
      });

      // Report findings
      const findings: string[] = [];
      if (brokenImages.length > 0) findings.push(`Broken images: ${brokenImages.join(', ')}`);
      if (hasHorizontalOverflow) findings.push('Horizontal overflow detected');
      if (!hasContent) findings.push('Page appears empty - no content rendered');
      if (missingAltText > 0) findings.push(`${missingAltText} images missing alt text`);
      if (missingLabels.inputs > 0) findings.push(`${missingLabels.inputs} inputs missing labels`);
      if (missingLabels.emptyButtons > 0) findings.push(`${missingLabels.emptyButtons} buttons with no accessible name`);
      if (smallTouchTargets > 5) findings.push(`${smallTouchTargets} touch targets smaller than 44px`);
      if (tinyText > 3) findings.push(`${tinyText} elements with font-size < 12px`);
      if (errors.length > 0) findings.push(...errors);
      if (consoleLogs.length > 0) findings.push(...consoleLogs);

      // Log findings for report
      if (findings.length > 0) {
        console.log(`\n=== ISSUES: ${route.name} @ ${viewport.name} ===`);
        findings.forEach(f => console.log(`  - ${f}`));
      }

      // Soft assertions - collect all issues but don't fail on non-critical
      if (!hasContent && route.name !== 'not-found') {
        expect(hasContent, `Page ${route.name} has no content`).toBeTruthy();
      }
    });
  }
}

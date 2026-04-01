const { chromium } = require('playwright');

const BASE = 'http://localhost:5173';
const ROUTES = [
  { path: '/', name: 'landing' },
  { path: '/app', name: 'dashboard' },
  { path: '/billing', name: 'billing' },
  { path: '/projects', name: 'projects' },
];

const VIEWPORTS = [
  { width: 375, height: 812, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const outDir = process.argv[2] || '.luna/coderailflow/heal-report/iteration-1/screenshots';

  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      try {
        await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(1000);
        const filename = `${outDir}/${route.name}-${vp.name}.png`;
        await page.screenshot({ path: filename, fullPage: true });
        console.log(`OK: ${filename}`);
      } catch (e) {
        console.error(`FAIL: ${route.name}-${vp.name}: ${e.message}`);
      }
      await page.close();
    }
  }
  await browser.close();
  console.log('Done');
})();

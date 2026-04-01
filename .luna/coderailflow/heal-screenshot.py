import sys, os
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:5173'
ROUTES = [
    ('/', 'landing'),
    ('/app', 'dashboard'),
    ('/billing', 'billing'),
    ('/projects', 'projects'),
]
VIEWPORTS = [
    (375, 812, 'mobile'),
    (768, 1024, 'tablet'),
    (1440, 900, 'desktop'),
]

out_dir = sys.argv[1] if len(sys.argv) > 1 else '.luna/coderailflow/heal-report/iteration-1/screenshots'
os.makedirs(out_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for path, name in ROUTES:
        for w, h, vp_name in VIEWPORTS:
            page = browser.new_page(viewport={'width': w, 'height': h})
            try:
                page.goto(f'{BASE}{path}', wait_until='networkidle', timeout=10000)
                page.wait_for_timeout(1000)
                filename = f'{out_dir}/{name}-{vp_name}.png'
                page.screenshot(path=filename, full_page=True)
                print(f'OK: {filename}')
            except Exception as e:
                print(f'FAIL: {name}-{vp_name}: {e}')
            page.close()
    browser.close()
print('Done')

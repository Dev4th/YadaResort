/**
 * Quick UI audit — captures screenshots of public + admin pages.
 * Usage: node scripts/ui-audit.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:5173';
const OUT = path.join(process.cwd(), 'tmp', 'ui-audit');

const publicPages = [
  { name: 'home', path: '/' },
  { name: 'booking', path: '/booking' },
  { name: 'check-booking', path: '/check-booking' },
  { name: 'terms', path: '/terms' },
];

const adminPages = [
  { name: 'admin-dashboard', path: '/admin' },
  { name: 'admin-bookings', path: '/admin/bookings' },
  { name: 'admin-billing', path: '/admin/billing' },
  { name: 'admin-payment-verify', path: '/admin/payment-verify' },
  { name: 'admin-rooms', path: '/admin/rooms' },
  { name: 'admin-settings', path: '/admin/settings' },
];

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'th-TH',
  });
  const page = await context.newPage();

  for (const p of publicPages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    await shot(page, p.name);
  }

  // Admin login
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
  await shot(page, 'admin-login');
  await page.getByPlaceholder('admin').fill('admin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.waitForURL('**/admin**', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  for (const p of adminPages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await shot(page, p.name);
  }

  // Mobile public home
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, 'home-mobile');

  await browser.close();
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

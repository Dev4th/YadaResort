import { chromium } from 'playwright';
import path from 'path';

const BASE = 'http://localhost:5173';
const OUT = path.join(process.cwd(), 'tmp', 'ui-audit');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });

  const sections = ['about', 'rooms', 'amenities', 'gallery', 'contact'];
  for (const id of sections) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, `home-${id}.png`) });
    console.log('saved', id);
  }

  await browser.close();
}

main();

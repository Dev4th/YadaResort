/**
 * Post-build prerender for key public SEO routes.
 * Requires: dist/ from vite build, optional API for room detail pages.
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import { chromium } from 'playwright';
import {
  root,
  STATIC_SEO_ROUTES,
  fetchRooms,
  readSeoRooms,
  roomSlug,
} from './seo-config.mjs';

const distDir = join(root, 'dist');
const previewPort = Number(process.env.PRERENDER_PORT || 4173);
const previewUrl = `http://127.0.0.1:${previewPort}`;

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`preview server not ready: ${url}`);
}

function startPreview() {
  const child = spawn(
    'npm',
    ['run', 'preview', '--', '--port', String(previewPort), '--strictPort', '--host', '127.0.0.1'],
    { cwd: root, stdio: 'pipe', shell: true, env: { ...process.env, BROWSER: 'none' } }
  );
  return child;
}

function writeHtml(route, html) {
  if (route === '/') {
    writeFileSync(join(distDir, 'index.html'), html, 'utf8');
    return;
  }
  const dir = join(distDir, route.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

async function main() {
  if (!existsSync(distDir)) {
    console.error('[prerender] dist/ not found — run vite build first');
    process.exit(1);
  }

  if (process.env.SKIP_PRERENDER === '1') {
    console.log('[prerender] skipped (SKIP_PRERENDER=1)');
    return;
  }

  let rooms = await fetchRooms();
  if (!rooms?.length) rooms = readSeoRooms();

  const routes = [
    ...STATIC_SEO_ROUTES,
    ...(rooms || []).map((room) => `/rooms/${roomSlug(room)}`),
  ];

  console.log(`[prerender] ${routes.length} routes`);

  const preview = startPreview();
  let browser;

  try {
    await waitForServer(`${previewUrl}/`);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    for (const route of routes) {
      const url = `${previewUrl}${route}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(600);
      writeHtml(route, await page.content());
      console.log(`[prerender] saved ${route}`);
    }

    await browser.close();
    browser = null;
    console.log('[prerender] done');
  } catch (error) {
    console.warn('[prerender] failed — continuing without static HTML snapshots');
    console.warn(error instanceof Error ? error.message : error);
    process.exitCode = 0;
  } finally {
    if (browser) await browser.close().catch(() => {});
    preview.kill('SIGTERM');
  }
}

main();

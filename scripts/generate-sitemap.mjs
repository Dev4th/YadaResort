import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sitemapPath = join(root, 'public', 'sitemap.xml');
const siteUrl = 'https://yadahomestay.com';
const apiBase = process.env.VITE_API_URL || 'http://localhost:3002/api';

function roomSlug(room) {
  const base = (room.name || 'room')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'room'}-${room.id.slice(0, 8)}`;
}

function urlEntry(loc, priority = '0.7', changefreq = 'weekly') {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

let baseXml = readFileSync(sitemapPath, 'utf8');
if (baseXml.includes('<!-- room-slugs -->')) {
  baseXml = baseXml.split('<!-- room-slugs -->')[0].trimEnd();
}

let roomUrls = [];
try {
  const res = await fetch(`${apiBase}/rooms`);
  if (res.ok) {
    const rooms = await res.json();
    roomUrls = (rooms || []).map((room) =>
      urlEntry(`${siteUrl}/rooms/${roomSlug(room)}`, '0.8', 'weekly')
    );
  }
} catch {
  console.warn('[sitemap] API unavailable — keeping static URLs only');
}

const roomBlock = roomUrls.length
  ? `\n  <!-- room-slugs -->\n${roomUrls.join('\n')}\n`
  : '';

const output = baseXml.replace('</urlset>', `${roomBlock}</urlset>`);
writeFileSync(sitemapPath, output);
console.log(`[sitemap] wrote ${roomUrls.length} room URLs`);

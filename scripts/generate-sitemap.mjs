import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  root,
  SITE_URL,
  STATIC_SEO_ROUTES,
  roomSlug,
  fetchRooms,
  readSeoRooms,
} from './seo-config.mjs';

const sitemapPath = join(root, 'public', 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);

function urlEntry(loc, priority = '0.7', changefreq = 'weekly') {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const priorityMap = {
  '/': '1.0',
  '/booking': '0.9',
  '/rooms': '0.9',
  '/check-booking': '0.4',
  '/phetchaburi-homestay': '0.8',
  '/family-room-phetchaburi': '0.75',
  '/pool-villa-phetchaburi': '0.75',
  '/nearby-attractions': '0.7',
  '/terms': '0.2',
  '/privacy': '0.2',
};

const staticEntries = STATIC_SEO_ROUTES.map((path) => {
  const loc = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  return urlEntry(loc, priorityMap[path] || '0.7');
});

let rooms = await fetchRooms();
let source = 'api';

if (!rooms?.length) {
  rooms = readSeoRooms();
  source = rooms.length ? 'seo-rooms.json' : 'none';
}

const roomEntries = (rooms || []).map((room) =>
  urlEntry(`${SITE_URL}/rooms/${roomSlug(room)}`, '0.8', 'weekly')
);

const output = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries.join('\n')}
  <!-- room-slugs -->
${roomEntries.join('\n')}
</urlset>
`;

writeFileSync(sitemapPath, output);
console.log(`[sitemap] wrote ${staticEntries.length} static + ${roomEntries.length} room URLs (source: ${source})`);

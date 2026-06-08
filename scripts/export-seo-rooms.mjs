import { writeFileSync } from 'fs';
import { join } from 'path';
import { root, fetchRooms } from './seo-config.mjs';

const outPath = join(root, 'public', 'seo-rooms.json');

const rooms = await fetchRooms();
if (!rooms?.length) {
  console.error('[seo-rooms] API unavailable — run backend first or use db:seed export');
  process.exit(1);
}

const payload = rooms.map((room) => ({ id: room.id, name: room.name }));
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`[seo-rooms] exported ${payload.length} rooms → public/seo-rooms.json`);

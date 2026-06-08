import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const root = join(__dirname, '..');

export const SITE_URL = process.env.VITE_SITE_URL || 'https://yadahomestay.com';

export const STATIC_SEO_ROUTES = [
  '/',
  '/rooms',
  '/booking',
  '/check-booking',
  '/phetchaburi-homestay',
  '/family-room-phetchaburi',
  '/pool-villa-phetchaburi',
  '/nearby-attractions',
  '/terms',
  '/privacy',
];

export function loadEnvFile() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

export function roomSlug(room) {
  const base = (room.name || 'room')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'room'}-${room.id.slice(0, 8)}`;
}

export function readSeoRooms() {
  const filePath = join(root, 'public', 'seo-rooms.json');
  if (!existsSync(filePath)) return [];
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function getApiBase() {
  loadEnvFile();
  return process.env.VITE_API_URL || 'http://localhost:3002/api';
}

export async function fetchRooms() {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/rooms`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function getAllPrerenderRoutes(rooms = []) {
  const roomRoutes = rooms.map((room) => `/rooms/${roomSlug(room)}`);
  return [...STATIC_SEO_ROUTES, ...roomRoutes];
}

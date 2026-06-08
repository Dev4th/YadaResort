import type { Room } from '@/stores/store';

export function roomSlug(room: Pick<Room, 'id' | 'name'>) {
  const base = (room.name || 'room')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'room'}-${room.id.slice(0, 8)}`;
}

export function roomIdFromSlug(slug?: string) {
  if (!slug) return '';
  return slug.split('-').pop() || '';
}

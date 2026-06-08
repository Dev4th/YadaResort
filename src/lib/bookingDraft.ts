const STORAGE_KEY = 'yada-booking-draft';
const GUEST_DRAFT_KEY = 'yada-guest-draft';

export type BookingDraft = {
  checkIn?: string;
  checkOut?: string;
  adults?: string;
};

export function saveBookingDraft(draft: BookingDraft) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore storage errors */
  }
}

export function getBookingDraft(): BookingDraft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookingDraft) : {};
  } catch {
    return {};
  }
}

export type GuestDraft = {
  name?: string;
  phone?: string;
  email?: string;
};

export function saveGuestDraft(draft: GuestDraft) {
  try {
    sessionStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function getGuestDraft(): GuestDraft {
  try {
    const raw = sessionStorage.getItem(GUEST_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as GuestDraft) : {};
  } catch {
    return {};
  }
}

export function buildBookingUrl(roomId?: string): string {
  const draft = getBookingDraft();
  const params = new URLSearchParams();
  if (roomId) params.set('room', roomId);
  if (draft.checkIn) params.set('checkIn', draft.checkIn);
  if (draft.checkOut) params.set('checkOut', draft.checkOut);
  if (draft.adults) params.set('adults', draft.adults);
  const query = params.toString();
  return `/booking${query ? `?${query}` : ''}`;
}

/**
 * supabase.ts — Migration shim
 * Supabase has been replaced with a self-hosted Postgres + Express API.
 * Export names are kept identical so existing imports continue to work.
 */
import api from './api';

// Stub: kept so code that imports `supabase` directly won't break at compile time.
// Real data access goes through the REST helpers below.
export const supabase = {
  channel: (_name: string) => ({
    on: (_event: string, _opts: any, _cb: any) => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
  }),
  removeChannel: (_ch: any) => {},
  auth: {
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null } }),
  },
  from: (_table: string) => ({ select: () => ({ data: null, error: null }) }),
  rpc: async (_fn: string, _args?: any) => ({ data: null, error: null }),
};

// Database types
export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          name: string;
          name_th: string;
          description: string;
          description_th: string;
          price: number;
          size: number;
          capacity: number;
          amenities: string[];
          images: string[];
          status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
          bed_type: string;
          view: string;
          created_at: string;
        };
        Insert: Omit<Tables['rooms']['Row'], 'id' | 'created_at'>;
        Update: Partial<Tables['rooms']['Row']>;
      };
      bookings: {
        Row: {
          id: string;
          room_id: string;
          guest_name: string;
          guest_phone: string;
          guest_email: string;
          guest_id_card: string | null;
          check_in: string;
          check_out: string;
          adults: number;
          children: number;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
          payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables['bookings']['Row']>;
      };
      guests: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          id_card: string | null;
          nationality: string | null;
          total_visits: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Tables['guests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Tables['guests']['Row']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          name_th: string;
          category: 'beverage' | 'alcohol' | 'snack' | 'other';
          price: number;
          cost: number;
          stock: number;
          unit: string;
          image: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Tables['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Tables['products']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          booking_id: string | null;
          room_id: string | null;
          guest_name: string;
          items: OrderItem[];
          subtotal: number;
          tax: number;
          total: number;
          status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid';
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables['orders']['Row']>;
      };
      users: {
        Row: {
          id: string;
          username: string;
          name: string;
          email: string;
          phone: string;
          role: 'owner' | 'admin' | 'receptionist' | 'staff';
          permissions: string[];
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          status?: string;
          password?: string;
        };
        Insert: Omit<Tables['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Tables['users']['Row']>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          order_id: string | null;
          amount: number;
          method: 'cash' | 'card' | 'transfer' | 'qr';
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          reference: string | null;
          notes: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: Omit<Tables['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Tables['payments']['Row']>;
      };
      room_cleaning: {
        Row: {
          id: string;
          room_id: string;
          status: 'pending' | 'in_progress' | 'completed' | 'inspected';
          assigned_to: string | null;
          notes: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Tables['room_cleaning']['Row'], 'id' | 'created_at'>;
        Update: Partial<Tables['room_cleaning']['Row']>;
      };
      maintenance_requests: {
        Row: {
          id: string;
          room_id: string;
          title: string;
          description: string;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'pending' | 'in_progress' | 'completed';
          assigned_to: string | null;
          cost: number | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Tables['maintenance_requests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Tables['maintenance_requests']['Row']>;
      };
      inventory_transactions: {
        Row: {
          id: string;
          product_id: string;
          type: 'in' | 'out' | 'adjustment';
          quantity: number;
          reason: string | null;
          reference: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: Omit<Tables['inventory_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Tables['inventory_transactions']['Row']>;
      };
    };
  };
};

type Tables = Database['public']['Tables'];

export type OrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
};

// Helper functions
export async function getRooms() {
  const { data } = await api.get('/rooms');
  return data || [];
}

export async function getAvailableRooms(checkIn?: string, checkOut?: string) {
  const params: Record<string, string> = {};
  if (checkIn) params.checkIn = checkIn;
  if (checkOut) params.checkOut = checkOut;
  const { data } = await api.get('/rooms/available', { params });
  return data || [];
}

// Check if a specific room is available for booking
export async function checkRoomAvailability(roomId: string, checkIn: string, checkOut: string): Promise<{ available: boolean; conflictingBookings?: any[] }> {
  const { data } = await api.get(`/rooms/availability/${roomId}`, { params: { checkIn, checkOut } });
  return data;
}

export async function createBooking(booking: Database['public']['Tables']['bookings']['Insert']) {
  const { data } = await api.post('/bookings', booking);
  return data;
}

export async function getBookings(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
  const { data } = await api.get('/bookings', { params: filters });
  return data || [];
}

export async function updateBookingStatus(
  id: string,
  status: Database['public']['Tables']['bookings']['Row']['status']
) {
  const { data } = await api.patch(`/bookings/${id}/status`, { status });
  return data;
}

export async function updateRoomStatus(
  id: string,
  status: Database['public']['Tables']['rooms']['Row']['status']
) {
  const { data } = await api.patch(`/rooms/${id}/status`, { status });
  return data;
}

export async function getProducts() {
  const { data } = await api.get('/products');
  return data || [];
}

export async function createOrder(order: Database['public']['Tables']['orders']['Insert']) {
  const { data } = await api.post('/orders', order);
  return data;
}

export async function getOrders(filters?: { status?: string; bookingId?: string }) {
  const params: Record<string, string> = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.bookingId) params.bookingId = filters.bookingId;
  const { data } = await api.get('/orders', { params });
  return data || [];
}

export async function createPayment(payment: Database['public']['Tables']['payments']['Insert']) {
  const { data } = await api.post('/payments', payment);
  return data;
}

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  return data;
}

export async function getGuests() {
  const { data } = await api.get('/guests');
  return data || [];
}

export async function upsertGuest(guest: Database['public']['Tables']['guests']['Insert']) {
  const { data } = await api.post('/guests', guest);
  return data;
}

// Auth functions
export async function signInWithPassword(_email: string, _password: string) {
  return { data: null, error: new Error('Use username/password login instead') };
}

export async function signOut() {
  await api.post('/auth/logout').catch(() => {});
}

export async function getCurrentUser() {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch {
    return null;
  }
}

// Realtime stubs — replaced by Socket.io (see src/lib/socket.ts)
export function subscribeToBookings(_callback: (payload: any) => void) {
  console.info('[supabase] subscribeToBookings → use Socket.io instead');
  return { unsubscribe: () => {} };
}

export function subscribeToOrders(_callback: (payload: any) => void) {
  console.info('[supabase] subscribeToOrders → use Socket.io instead');
  return { unsubscribe: () => {} };
}

export function subscribeToRooms(_callback: (payload: any) => void) {
  console.info('[supabase] subscribeToRooms → use Socket.io instead');
  return { unsubscribe: () => {} };
}

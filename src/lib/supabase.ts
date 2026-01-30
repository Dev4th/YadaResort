import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsejthphquirtqsuwumc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZWp0aHBocXVpcnRxc3V3dW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODk0MTEsImV4cCI6MjA4NTM2NTQxMX0.1WQ6PVlkJBCboCtZDz4C8nxMTtlccPM_SNAplJw-Hs8';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('price', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getAvailableRooms(checkIn?: string, checkOut?: string) {
  let query = supabase
    .from('rooms')
    .select('*')
    .eq('status', 'available');
  
  if (checkIn && checkOut) {
    // Get rooms that are not booked for the given dates
    const { data: bookedRoomIds } = await supabase
      .from('bookings')
      .select('room_id')
      .or(`and(check_in.lte.${checkOut},check_out.gte.${checkIn})`)
      .in('status', ['confirmed', 'checked-in']);
    
    if (bookedRoomIds && bookedRoomIds.length > 0) {
      const ids = bookedRoomIds.map(b => b.room_id);
      query = query.not('id', 'in', `(${ids.join(',')})`);
    }
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createBooking(booking: Database['public']['Tables']['bookings']['Insert']) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getBookings(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
  let query = supabase
    .from('bookings')
    .select('*, rooms(name_th, price)')
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.dateFrom) {
    query = query.gte('check_in', filters.dateFrom);
  }
  
  if (filters?.dateTo) {
    query = query.lte('check_out', filters.dateTo);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateBookingStatus(
  id: string, 
  status: Database['public']['Tables']['bookings']['Row']['status']
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateRoomStatus(
  id: string,
  status: Database['public']['Tables']['rooms']['Row']['status']
) {
  const { data, error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('category');
  
  if (error) throw error;
  return data || [];
}

export async function createOrder(order: Database['public']['Tables']['orders']['Insert']) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update product stock
  for (const item of order.items) {
    await supabase.rpc('decrease_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity
    });
  }
  
  return data;
}

export async function getOrders(filters?: { status?: string; bookingId?: string }) {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.bookingId) {
    query = query.eq('booking_id', filters.bookingId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createPayment(payment: Database['public']['Tables']['payments']['Insert']) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  
  const [
    { data: totalBookings },
    { data: todayCheckIns },
    { data: todayCheckOuts },
    { data: occupiedRooms },
    { data: availableRooms },
    { data: pendingOrders },
    { data: todayRevenue },
    { data: monthlyRevenue }
  ] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact' }),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('check_in', today).eq('status', 'confirmed'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('check_out', today).eq('status', 'checked-in'),
    supabase.from('rooms').select('id', { count: 'exact' }).eq('status', 'occupied'),
    supabase.from('rooms').select('id', { count: 'exact' }).eq('status', 'available'),
    supabase.from('orders').select('id', { count: 'exact' }).neq('status', 'paid'),
    supabase.rpc('get_today_revenue'),
    supabase.rpc('get_monthly_revenue')
  ]);
  
  return {
    totalBookings: totalBookings?.length || 0,
    todayCheckIns: todayCheckIns?.length || 0,
    todayCheckOuts: todayCheckOuts?.length || 0,
    occupiedRooms: occupiedRooms?.length || 0,
    availableRooms: availableRooms?.length || 0,
    pendingOrders: pendingOrders?.length || 0,
    todayRevenue: todayRevenue || 0,
    monthlyRevenue: monthlyRevenue || 0
  };
}

export async function getGuests() {
  const { data, error } = await supabase
    .from('guests')
    .select('*, bookings(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function upsertGuest(guest: Database['public']['Tables']['guests']['Insert']) {
  const { data, error } = await supabase
    .from('guests')
    .upsert(guest, { onConflict: 'phone' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Auth functions
export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return data;
}

// Realtime subscriptions
export function subscribeToBookings(callback: (payload: any) => void) {
  return supabase
    .channel('bookings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, callback)
    .subscribe();
}

export function subscribeToOrders(callback: (payload: any) => void) {
  return supabase
    .channel('orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .subscribe();
}

export function subscribeToRooms(callback: (payload: any) => void) {
  return supabase
    .channel('rooms')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, callback)
    .subscribe();
}

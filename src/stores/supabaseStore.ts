import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getRooms, getBookings, getProducts, getOrders, getDashboardStats, getGuests, type Database } from '@/lib/supabase';

// Types
export type Room = Database['public']['Tables']['rooms']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Guest = Database['public']['Tables']['guests']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

export interface DashboardStats {
  totalBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  occupiedRooms: number;
  availableRooms: number;
  pendingOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

// Room Store
interface RoomState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  getAvailableRooms: (checkIn?: string, checkOut?: string) => Promise<Room[]>;
  updateRoomStatus: (id: string, status: Room['status']) => Promise<void>;
  getRoomById: (id: string) => Room | undefined;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  loading: false,
  error: null,
  
  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const rooms = await getRooms();
      set({ rooms, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  getAvailableRooms: async (_checkIn?: string, _checkOut?: string) => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available');
    
    if (error) throw error;
    return data || [];
  },
  
  updateRoomStatus: async (id: string, status: Room['status']) => {
    const { error } = await supabase
      .from('rooms')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      rooms: state.rooms.map(r => r.id === id ? { ...r, status } : r)
    }));
  },
  
  getRoomById: (id: string) => get().rooms.find(r => r.id === id)
}));

// Booking Store
interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: (filters?: { status?: string; dateFrom?: string; dateTo?: string }) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  getBookingById: (id: string) => Booking | undefined;
  getTodayCheckIns: () => Booking[];
  getTodayCheckOuts: () => Booking[];
  getCurrentGuests: () => Booking[];
  confirmBooking: (id: string) => Promise<void>;
  checkIn: (id: string) => Promise<void>;
  checkOut: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,
  
  fetchBookings: async (filters) => {
    set({ loading: true, error: null });
    try {
      const bookings = await getBookings(filters);
      set({ bookings, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createBooking: async (bookingData) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (error) throw error;
    
    set(state => ({ bookings: [data, ...state.bookings] }));
    return data;
  },
  
  updateBookingStatus: async (id: string, status: Booking['status']) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b)
    }));
  },
  
  checkIn: async (id: string) => {
    const booking = get().bookings.find(b => b.id === id);
    if (!booking) return;
    
    await get().updateBookingStatus(id, 'checked-in');
    
    // Update room status to occupied
    await supabase
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', booking.room_id);
  },
  
  confirmBooking: async (id: string) => {
    await get().updateBookingStatus(id, 'confirmed');
  },
  
  checkOut: async (id: string) => {
    const booking = get().bookings.find(b => b.id === id);
    if (!booking) return;
    
    await get().updateBookingStatus(id, 'checked-out');
    
    // Update room status to cleaning
    await supabase
      .from('rooms')
      .update({ status: 'cleaning' })
      .eq('id', booking.room_id);
  },
  
  cancelBooking: async (id: string) => {
    const booking = get().bookings.find(b => b.id === id);
    if (!booking) return;
    
    await get().updateBookingStatus(id, 'cancelled');
    
    // Update room status to available
    await supabase
      .from('rooms')
      .update({ status: 'available' })
      .eq('id', booking.room_id);
  },
  
  getBookingById: (id: string) => get().bookings.find(b => b.id === id),
  
  getTodayCheckIns: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().bookings.filter(b => 
      b.check_in === today && b.status === 'confirmed'
    );
  },
  
  getTodayCheckOuts: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().bookings.filter(b => 
      b.check_out === today && b.status === 'checked-in'
    );
  },
  
  getCurrentGuests: () => {
    return get().bookings.filter(b => b.status === 'checked-in');
  }
}));

// Product Store
interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProductsByCategory: (category: Product['category']) => Product[];
  updateStock: (id: string, quantity: number) => Promise<void>;
  getLowStockProducts: () => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await getProducts();
      set({ products, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  getProductsByCategory: (category: Product['category']) => 
    get().products.filter(p => p.category === category && p.is_active),
  
  updateStock: async (id: string, quantity: number) => {
    const { error } = await supabase.rpc('update_stock', {
      p_product_id: id,
      p_quantity: quantity
    });
    
    if (error) throw error;
    
    await get().fetchProducts();
  },
  
  getLowStockProducts: () => 
    get().products.filter(p => p.stock <= 10 && p.is_active)
}));

// Order Store
interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: (filters?: { status?: string; bookingId?: string }) => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  getPendingOrders: () => Order[];
  getOrdersByBooking: (bookingId: string) => Order[];
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  
  fetchOrders: async (filters) => {
    set({ loading: true, error: null });
    try {
      const orders = await getOrders(filters);
      set({ orders, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createOrder: async (orderData) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update product stock
    for (const item of orderData.items) {
      await supabase.rpc('decrease_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      });
    }
    
    set(state => ({ orders: [data, ...state.orders] }));
    return data;
  },
  
  updateOrderStatus: async (id: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
    }));
  },
  
  getPendingOrders: () => get().orders.filter(o => o.status !== 'paid'),
  
  getOrdersByBooking: (bookingId: string) => 
    get().orders.filter(o => o.booking_id === bookingId)
}));

// Guest Store
interface GuestState {
  guests: Guest[];
  loading: boolean;
  error: string | null;
  fetchGuests: () => Promise<void>;
  upsertGuest: (guest: Omit<Guest, 'id' | 'created_at'>) => Promise<Guest>;
  getGuestByPhone: (phone: string) => Guest | undefined;
}

export const useGuestStore = create<GuestState>((set, get) => ({
  guests: [],
  loading: false,
  error: null,
  
  fetchGuests: async () => {
    set({ loading: true, error: null });
    try {
      const guests = await getGuests();
      set({ guests, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  upsertGuest: async (guestData) => {
    const { data, error } = await supabase
      .from('guests')
      .upsert(guestData, { onConflict: 'phone' })
      .select()
      .single();
    
    if (error) throw error;
    
    set(state => {
      const exists = state.guests.find(g => g.phone === guestData.phone);
      if (exists) {
        return { guests: state.guests.map(g => g.phone === guestData.phone ? data : g) };
      }
      return { guests: [data, ...state.guests] };
    });
    
    return data;
  },
  
  getGuestByPhone: (phone: string) => get().guests.find(g => g.phone === phone)
}));

// Dashboard Store
interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: {
    totalBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0
  },
  loading: false,
  error: null,
  
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await getDashboardStats();
      set({ stats, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  refreshStats: async () => {
    await get().fetchStats();
  }
}));

// Auth Store
interface AuthState {
  user: User | null;
  session: any;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      login: async (username: string, password: string) => {
        set({ loading: true, error: null });
        try {
          // Try RPC function first (for hashed passwords)
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('simple_login', { p_username: username, p_password: password });
          
          if (!rpcError && rpcData && rpcData.length > 0) {
            const userData = rpcData[0];
            set({
              user: userData,
              session: { access_token: 'local-session', user: userData },
              isAuthenticated: true,
              loading: false,
              error: null
            });
            return true;
          }
          
          // Fallback to simple query (for plain text passwords during migration)
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('status', 'active')
            .single();
          
          if (error || !userData) {
            set({ loading: false, error: 'ไม่พบผู้ใช้งานนี้' });
            return false;
          }
          
          // Simple password check (for migration period)
          if (userData.password !== password) {
            set({ loading: false, error: 'รหัสผ่านไม่ถูกต้อง' });
            return false;
          }
          
          set({
            user: userData,
            session: { access_token: 'local-session', user: userData },
            isAuthenticated: true,
            loading: false,
            error: null
          });
          
          return true;
        } catch (error: any) {
          set({ loading: false, error: error.message || 'เกิดข้อผิดพลาด' });
          return false;
        }
      },
      
      logout: async () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          error: null
        });
      },
      
      checkSession: async () => {
        // Check if session exists in persisted state
        const { user, session } = get();
        if (user && session) {
          // Verify user still exists and is active
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error || !userData || userData.status !== 'active') {
            set({
              user: null,
              session: null,
              isAuthenticated: false
            });
          } else {
            set({
              user: userData,
              isAuthenticated: true
            });
          }
        }
      },
      
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'owner') return true; // Admin/Owner has all permissions
        return user?.permissions?.includes(permission) || false;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

// UI Store
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  notifications: [],
  addNotification: (notification) => 
    set(state => ({ notifications: [notification, ...state.notifications] })),
  clearNotifications: () => set({ notifications: [] })
}));

// Settings Store
export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  details?: string;
}

export interface BankAccount {
  bankCode: string; // รหัสธนาคาร เช่น '004' = กสิกร, '014' = ไทยพาณิชย์
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface ResortSettings {
  // ข้อมูลรีสอร์ท
  hotelName: string;
  hotelNameTh: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  
  // การเข้าพัก
  checkInTime: string;
  checkOutTime: string;
  taxRate: number;
  
  // การชำระเงิน
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
  promptPayNumber: string;
  promptPayName: string;
  qrCodeUrl: string;
}

interface SettingsState {
  settings: ResortSettings;
  loading: boolean;
  updateSettings: (settings: Partial<ResortSettings>) => void;
  getSettings: () => ResortSettings;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const defaultSettings: ResortSettings = {
  hotelName: 'Yada Homestay',
  hotelNameTh: 'ญาดาโฮมสเตย์',
  address: '80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000',
  phone: '081-234-5678',
  email: 'info@yadahomestay.com',
  taxId: '1234567890123',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  taxRate: 7,
  paymentMethods: [
    { id: 'cash', name: 'เงินสด', enabled: true },
    { id: 'card', name: 'บัตรเครดิต/เดบิต', enabled: true },
    { id: 'transfer', name: 'โอนเงิน', enabled: true },
    { id: 'promptpay', name: 'PromptPay', enabled: true },
  ],
  bankAccounts: [
    { bankCode: '004', bankName: 'ธนาคารกสิกรไทย', accountName: 'ญาดาโฮมสเตย์', accountNumber: '123-4-56789-0' },
    { bankCode: '014', bankName: 'ธนาคารไทยพาณิชย์', accountName: 'ญาดาโฮมสเตย์', accountNumber: '987-6-54321-0' },
  ],
  promptPayNumber: '081-234-5678',
  promptPayName: 'ญาดาโฮมสเตย์',
  qrCodeUrl: '',
};

export const useSettingsStore = create(
  persist<SettingsState>(
    (set, get) => ({
      settings: defaultSettings,
      loading: false,
      
      updateSettings: (newSettings: Partial<ResortSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      getSettings: () => get().settings,
      
      saveSettings: async () => {
        set({ loading: true });
        try {
          const { settings } = get();
          
          // Try to upsert settings
          const { error } = await supabase
            .from('settings')
            .upsert({ 
              id: 'main', 
              data: settings,
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            // If table doesn't exist, just save to localStorage (persist will handle)
            if (error.code === '42P01') {
              console.log('Settings table not found, using localStorage only');
            } else {
              console.error('Save settings error:', error);
            }
          } else {
            console.log('Settings saved to database');
          }
        } catch (error) {
          console.error('Save settings error:', error);
        } finally {
          set({ loading: false });
        }
      },
      
      loadSettings: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('settings')
            .select('data')
            .eq('id', 'main')
            .single();
          
          if (data && !error) {
            set({ settings: { ...defaultSettings, ...data.data } });
            console.log('Settings loaded from database');
          }
        } catch (error) {
          console.log('Using localStorage settings');
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'resort-settings',
    }
  )
);

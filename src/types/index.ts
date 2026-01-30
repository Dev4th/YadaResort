// Room Types
export interface Room {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  price: number;
  size: number;
  capacity: number;
  amenities: string[];
  images: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  bedType: string;
  view: string;
}

// Booking Types
export interface Booking {
  id: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Guest Types
export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  idCard?: string;
  nationality?: string;
  bookings: Booking[];
  totalVisits: number;
  notes?: string;
}

// Product Types (Bar/Beverage)
export interface Product {
  id: string;
  name: string;
  nameTh: string;
  category: 'beverage' | 'alcohol' | 'snack' | 'other';
  price: number;
  cost: number;
  stock: number;
  unit: string;
  image?: string;
  isActive: boolean;
}

// Order Types
export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  bookingId?: string;
  roomId?: string;
  guestName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid';
  paymentMethod?: 'cash' | 'card' | 'transfer';
  createdAt: Date;
  updatedAt: Date;
}

// User Types (Staff/Admin)
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'receptionist' | 'staff';
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export type Permission = 
  | 'dashboard_view'
  | 'bookings_manage'
  | 'rooms_manage'
  | 'guests_manage'
  | 'orders_manage'
  | 'products_manage'
  | 'reports_view'
  | 'users_manage'
  | 'settings_manage';

// Dashboard Types
export interface DashboardStats {
  totalBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  occupiedRooms: number;
  availableRooms: number;
  todayRevenue: number;
  monthlyRevenue: number;
  pendingOrders: number;
}

export interface RoomStatus {
  roomId: string;
  roomName: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  currentBooking?: Booking;
  nextBooking?: Booking;
}

// Payment Types
export interface Payment {
  id: string;
  bookingId?: string;
  orderId?: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'qr';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

// Report Types
export interface DailyReport {
  date: Date;
  totalBookings: number;
  totalRevenue: number;
  roomRevenue: number;
  fnbRevenue: number;
  newGuests: number;
  occupancyRate: number;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar?: string;
  date: Date;
}

// Amenity Types
export interface Amenity {
  id: string;
  name: string;
  nameTh: string;
  icon: string;
  description: string;
}

// Gallery Types
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  size: 'small' | 'medium' | 'large';
}

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import AdminCommandPalette from '@/components/admin/AdminCommandPalette';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays as CalendarIcon,
  Bed,
  Users,
  Coffee,
  Wine,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Sparkles,
  Wrench,
  Package,
  Receipt,
  UserCog,
  ClipboardList
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore, useUIStore } from '@/stores/store';
import { getSocket } from '@/lib/socket';
import api from '@/lib/api';

import { Seo } from '@/lib/seo';

const Dashboard = lazy(() => import('./admin/Dashboard'));
const Bookings = lazy(() => import('./admin/Bookings'));
const BookingCalendar = lazy(() => import('./admin/BookingCalendar'));
const Rooms = lazy(() => import('./admin/Rooms'));
const RoomCleaning = lazy(() => import('./admin/RoomCleaning'));
const Maintenance = lazy(() => import('./admin/Maintenance'));
const Guests = lazy(() => import('./admin/Guests'));
const POS = lazy(() => import('./admin/POS'));
const Bar = lazy(() => import('./admin/Bar'));
const Inventory = lazy(() => import('./admin/Inventory'));
const Billing = lazy(() => import('./admin/Billing'));
const PaymentVerification = lazy(() => import('./admin/PaymentVerification'));
const Operations = lazy(() => import('./admin/Operations'));
const Reports = lazy(() => import('./admin/Reports'));
const Staff = lazy(() => import('./admin/Staff'));
const SettingsPage = lazy(() => import('./admin/Settings'));

type NavItem = {
  path: string;
  icon: typeof LayoutDashboard;
  label: string;
  permission: string;
  badgeKey?: 'pendingBookings' | 'pendingSlips' | 'cleaning';
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'ภาพรวม',
    items: [
      { path: '', icon: LayoutDashboard, label: 'แดชบอร์ด', permission: 'dashboard_view' },
      { path: 'operations', icon: ClipboardList, label: 'คิวงาน', permission: 'dashboard_view', badgeKey: 'pendingBookings' },
    ],
  },
  {
    title: 'การจอง',
    items: [
      { path: 'bookings', icon: Calendar, label: 'การจอง', permission: 'bookings_manage', badgeKey: 'pendingBookings' },
      { path: 'calendar', icon: CalendarIcon, label: 'ปฏิทิน', permission: 'bookings_manage' },
      { path: 'pos', icon: Coffee, label: 'Check-in/out', permission: 'bookings_manage' },
    ],
  },
  {
    title: 'ห้องพัก',
    items: [
      { path: 'rooms', icon: Bed, label: 'ห้องพัก', permission: 'rooms_manage' },
      { path: 'cleaning', icon: Sparkles, label: 'ทำความสะอาด', permission: 'rooms_manage', badgeKey: 'cleaning' },
      { path: 'maintenance', icon: Wrench, label: 'ซ่อมบำรุง', permission: 'rooms_manage' },
    ],
  },
  {
    title: 'ลูกค้า & ยอดขาย',
    items: [
      { path: 'guests', icon: Users, label: 'ลูกค้า', permission: 'guests_manage' },
      { path: 'bar', icon: Wine, label: 'บาร์ & เครื่องดื่ม', permission: 'orders_manage' },
      { path: 'inventory', icon: Package, label: 'คลังสินค้า', permission: 'products_manage' },
    ],
  },
  {
    title: 'การเงิน',
    items: [
      { path: 'billing', icon: CreditCard, label: 'การเงิน', permission: 'bookings_manage' },
      { path: 'payment-verify', icon: Receipt, label: 'ตรวจสอบการชำระ', permission: 'bookings_manage', badgeKey: 'pendingSlips' },
    ],
  },
  {
    title: 'ระบบ',
    items: [
      { path: 'reports', icon: BarChart3, label: 'รายงาน', permission: 'reports_view' },
      { path: 'staff', icon: UserCog, label: 'พนักงาน', permission: 'users_manage' },
      { path: 'settings', icon: Settings, label: 'ตั้งค่า', permission: 'settings_manage' },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

const bookingRefFromId = (id: string) => {
  const num = parseInt(id.replace(/-/g, '').slice(0, 6), 16) % 1000000;
  return `BK-${num.toString().padStart(6, '0')}`;
};

function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [badges, setBadges] = useState({
    pendingBookings: 0,
    pendingSlips: 0,
    cleaning: 0,
  });

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [bookingsRes, slipsRes, roomsRes] = await Promise.all([
          api.get('/bookings', { params: { status: 'pending' } }),
          api.get('/payment-slips', { params: { status: 'pending' } }),
          api.get('/rooms'),
        ]);
        const cleaningCount = (roomsRes.data || []).filter((r: { status: string }) => r.status === 'cleaning').length;
        setBadges({
          pendingBookings: (bookingsRes.data || []).length,
          pendingSlips: (slipsRes.data || []).length,
          cleaning: cleaningCount,
        });
      } catch {
        /* ignore badge load errors */
      }
    };
    loadBadges();
    const interval = setInterval(loadBadges, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-yada-dark via-yada-primary to-yada-primary-hover text-white transition-transform duration-300 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold">Yada Homestay</h1>
              <p className="text-xs text-yada-accent">ระบบจัดการ</p>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yada-accent ring-2 ring-yada-accent/50 ring-offset-1 ring-offset-yada-primary">
              <span className="font-bold text-yada-text">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{user?.name || 'Admin'}</p>
              <p className="text-xs text-white/60">
                {user?.role === 'owner'
                  ? 'เจ้าของ'
                  : user?.role === 'admin'
                  ? 'ผู้ดูแลระบบ'
                  : user?.role === 'receptionist'
                  ? 'พนักงานต้อนรับ'
                  : 'พนักงาน'}
              </p>
            </div>
          </div>
        </div>

        <nav className="h-[calc(100vh-220px)] space-y-4 overflow-y-auto p-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              user?.permissions?.includes(item.permission as never)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === `/admin/${item.path}` ||
                      (item.path === '' && location.pathname === '/admin');
                    const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                    return (
                      <NavLink
                        key={item.path}
                        to={`/admin/${item.path}`}
                        end={item.path === ''}
                        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-200 ${
                          isActive
                            ? 'bg-white/15 font-medium text-white shadow-md ring-1 ring-white/25'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="min-w-[1.25rem] rounded-full bg-white/20 px-1.5 py-0.5 text-center text-[10px] font-bold">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-yada-dark/80 p-4 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/80 transition-colors hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function Header() {
  const { toggleSidebar } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('booking:created', (booking: any) => {
      setNotifications((prev) => [{
        id: booking.id,
        type: 'booking',
        message: `การจองใหม่จาก ${booking.guest_name}`,
        time: new Date(),
        read: false,
        link: `/admin/bookings?highlight=${booking.id}`,
      }, ...prev].slice(0, 10));
    });

    socket.on('booking:updated', (booking: any) => {
      if (booking.newStatus === 'checked-in') {
        setNotifications((prev) => [{
          id: `${booking.id}-checkin`,
          type: 'booking',
          message: `${booking.guest_name} check-in แล้ว`,
          time: new Date(),
          read: false,
          link: '/admin/pos',
        }, ...prev].slice(0, 10));
      }
    });

    socket.on('payment-slip:created', (slip: any) => {
      setNotifications((prev) => [{
        id: `${slip.id}-slip`,
        type: 'payment',
        message: `สลิปโอนเงินใหม่ ฿${Number(slip.amount || 0).toLocaleString()}`,
        time: new Date(),
        read: false,
        link: '/admin/payment-verify',
      }, ...prev].slice(0, 10));
    });

    return () => {
      socket.off('booking:created');
      socket.off('booking:updated');
      socket.off('payment-slip:created');
    };
  }, []);

  const runGlobalSearch = async (query: string) => {
    const q = query.toLowerCase();
    setSearchLoading(true);
    const results: any[] = [];

    try {
      const { data: bookings } = await api.get('/bookings');
      const filtered = (bookings || []).filter((b: any) =>
        b.guest_name?.toLowerCase().includes(q) ||
        b.guest_phone?.includes(query) ||
        b.id?.toLowerCase().includes(q) ||
        bookingRefFromId(b.id).toLowerCase().includes(q)
      ).slice(0, 5);
      results.push(...filtered.map((b: any) => ({
        type: 'booking',
        id: b.id,
        title: b.guest_name,
        subtitle: `${b.guest_phone} · ${bookingRefFromId(b.id)}`,
        status: b.status,
        link: `/admin/bookings?highlight=${b.id}`,
      })));
    } catch { /* ignore */ }

    try {
      const { data: rooms } = await api.get('/rooms');
      const filtered = (rooms || []).filter((r: any) =>
        r.name?.toLowerCase().includes(q) ||
        r.name_th?.toLowerCase().includes(q)
      ).slice(0, 5);
      results.push(...filtered.map((r: any) => ({
        type: 'room',
        id: r.id,
        title: r.name_th || r.name,
        subtitle: r.name,
        status: r.status,
        link: `/admin/rooms?highlight=${r.id}`,
      })));
    } catch { /* ignore */ }

    try {
      const { data: guests } = await api.get('/guests');
      const filtered = (guests || []).filter((g: any) =>
        g.name?.toLowerCase().includes(q) ||
        g.phone?.includes(query)
      ).slice(0, 5);
      results.push(...filtered.map((g: any) => ({
        type: 'guest',
        id: g.id,
        title: g.name,
        subtitle: g.phone,
        link: `/admin/guests?search=${encodeURIComponent(g.phone)}`,
      })));
    } catch { /* ignore */ }

    setSearchResults(results);
    setSearchLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchDebounceRef.current !== null) clearTimeout(searchDebounceRef.current);
    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    searchDebounceRef.current = setTimeout(() => runGlobalSearch(query), 300);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    const path = location.pathname.replace('/admin/', '');
    const item = navItems.find(i => i.path === path);
    return item?.label || 'แดชบอร์ด';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className="text-xl font-bold text-yada-text">{getPageTitle()}</h2>
            <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span>แอดมิน</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-yada-text">{getPageTitle()}</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 sm:px-4">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา... (Ctrl+K)"
                className="w-full min-w-0 bg-transparent border-none text-sm outline-none"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                {searchResults.map((result, idx) => (
                  <button
                    key={`${result.type}-${result.id}-${idx}`}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left border-b border-gray-100 last:border-0"
                    onClick={() => {
                      navigate(result.link);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                      result.type === 'booking' ? 'bg-blue-500' :
                      result.type === 'room' ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                      {result.type === 'booking' ? 'B' : result.type === 'room' ? 'R' : 'G'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                    </div>
                    {result.status && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        result.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        result.status === 'available' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {result.status}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showSearch && searchQuery.length >= 2 && searchLoading && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                <p className="text-center text-sm text-gray-500">กำลังค้นหา...</p>
              </div>
            )}

            {showSearch && searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                <p className="text-sm text-gray-500 text-center">ไม่พบผลการค้นหา</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold">การแจ้งเตือน</h3>
                    {notifications.length > 0 && (
                      <button 
                        className="text-xs text-yada-primary hover:underline"
                        onClick={markAllAsRead}
                      >
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">ไม่มีการแจ้งเตือน</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => {
                            navigate(notif.link || '/admin/bookings');
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                            );
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-yada-primary/10 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-yada-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatTime(notif.time)}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100">
                      <button 
                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                        onClick={clearNotifications}
                      >
                        ล้างการแจ้งเตือนทั้งหมด
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <Button
            size="sm"
            variant="yada"
            className="hidden sm:flex"
            onClick={() => navigate('/admin/bookings?walkIn=1')}
          >
            + จองห้องใหม่
          </Button>
        </div>
      </div>
    </header>
  );
}

// Login Component
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(username, password);
    if (success) {
      navigate('/admin');
    }
    setLoading(false);
  };

  const features = [
    { number: '01', text: 'จัดการห้องพักและการจอง' },
    { number: '02', text: 'ระบบ POS และมินิบาร์' },
    { number: '03', text: 'รายงานและสถิติ' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="relative hidden flex-col justify-center overflow-hidden bg-gradient-to-br from-yada-dark via-yada-primary to-yada-primary-hover p-12 text-white lg:flex lg:w-1/2">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 max-w-lg">
          {/* Logo Icon */}
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
            <Bed className="w-8 h-8 text-white" />
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl font-bold font-serif mb-4">YadaHomestay</h1>
          <p className="text-white/70 text-lg mb-12">
            ระบบจัดการรีสอร์ทครบวงจร สำหรับพนักงานและเจ้าของ
          </p>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.number} className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-sm font-medium">
                  {feature.number}
                </span>
                <span className="text-white/80">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold font-serif text-yada-primary">YadaHomestay</h1>
            <p className="text-yada-accent">ระบบจัดการ</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-yada-text">เข้าสู่ระบบ</h2>
              <p className="text-gray-500 mt-1">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อผู้ใช้
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-yada-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-yada-primary pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <span className="text-sm">👁</span>
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="yada"
                className="w-full py-3"
                disabled={loading}
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            {!import.meta.env.PROD && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="mb-3 text-xs text-gray-400">ข้อมูลทดลอง (dev only):</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>ชื่อผู้ใช้</span>
                    <span className="font-mono font-medium">admin</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>รหัสผ่าน</span>
                    <span className="font-mono font-medium">admin123</span>
                  </div>
                </div>
              </div>
            )}

            {/* Back to main site */}
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-gray-400 hover:text-yada-primary transition-colors"
              >
                ← กลับสู่หน้าหลัก
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Layout
function DashboardLayout() {
  const { checkSession } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminCommandPalette onWalkIn={() => navigate('/admin/bookings?walkIn=1')} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Suspense fallback={<div className="min-h-[240px] animate-pulse rounded-lg bg-white" />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/operations" element={<Operations />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/calendar" element={<BookingCalendar />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/cleaning" element={<RoomCleaning />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/payment-verify" element={<PaymentVerification />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <>
        <Seo
          title="ระบบจัดการ Yada Homestay"
          description="ระบบจัดการภายในสำหรับพนักงาน Yada Homestay"
          path="/admin"
          noIndex
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-yada-primary border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Seo
          title="เข้าสู่ระบบแอดมิน | Yada Homestay"
          description="เข้าสู่ระบบจัดการการจอง ห้องพัก การเงิน และงานปฏิบัติการของ Yada Homestay"
          path="/admin"
          noIndex
        />
        <Login />
      </>
    );
  }

  return (
    <>
      <Seo
        title="แดชบอร์ดแอดมิน | Yada Homestay"
        description="แดชบอร์ดปฏิบัติการรายวันสำหรับจัดการการจอง ห้องพัก ลูกค้า การชำระเงิน และรายงาน"
        path="/admin"
        noIndex
      />
      <DashboardLayout />
    </>
  );
}

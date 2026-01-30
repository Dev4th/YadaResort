import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
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
  Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore, useUIStore } from '@/stores/supabaseStore';
import { supabase } from '@/lib/supabase';

// Admin Pages
import Dashboard from './admin/Dashboard';
import Bookings from './admin/Bookings';
import Rooms from './admin/Rooms';
import RoomCleaning from './admin/RoomCleaning';
import Maintenance from './admin/Maintenance';
import Guests from './admin/Guests';
import POS from './admin/POS';
import Bar from './admin/Bar';
import Inventory from './admin/Inventory';
import Billing from './admin/Billing';
import Reports from './admin/Reports';
import SettingsPage from './admin/Settings';

const navItems = [
  { path: '', icon: LayoutDashboard, label: 'แดชบอร์ด', permission: 'dashboard_view' },
  { path: 'bookings', icon: Calendar, label: 'การจอง', permission: 'bookings_manage' },
  { path: 'rooms', icon: Bed, label: 'ห้องพัก', permission: 'rooms_manage' },
  { path: 'cleaning', icon: Sparkles, label: 'ทำความสะอาด', permission: 'rooms_manage' },
  { path: 'maintenance', icon: Wrench, label: 'ซ่อมบำรุง', permission: 'rooms_manage' },
  { path: 'guests', icon: Users, label: 'ลูกค้า', permission: 'guests_manage' },
  { path: 'pos', icon: Coffee, label: 'Check-in/out', permission: 'bookings_manage' },
  { path: 'bar', icon: Wine, label: 'บาร์ & เครื่องดื่ม', permission: 'orders_manage' },
  { path: 'inventory', icon: Package, label: 'คลังสินค้า', permission: 'products_manage' },
  { path: 'billing', icon: CreditCard, label: 'การเงิน', permission: 'bookings_manage' },
  { path: 'reports', icon: BarChart3, label: 'รายงาน', permission: 'reports_view' },
  { path: 'settings', icon: Settings, label: 'ตั้งค่า', permission: 'settings_manage' },
];

function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-serif">Yada Homestay</h1>
              <p className="text-xs text-[#c9a962]">ระบบจัดการ</p>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c9a962] flex items-center justify-center">
              <span className="font-bold text-[#1a1a1a]">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || 'Admin'}</p>
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

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-220px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasPermission = user?.permissions?.includes(item.permission as any);
            const isActive = location.pathname === `/admin/${item.path}` || 
              (item.path === '' && location.pathname === '/admin');
            
            if (!hasPermission) return null;

            return (
              <NavLink
                key={item.path}
                to={`/admin/${item.path}`}
                end={item.path === ''}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#c9a962] text-[#1a1a1a]'
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#1a1a1a]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <LogOut className="w-5 h-5" />
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
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [{
            id: payload.new.id,
            type: 'booking',
            message: `การจองใหม่จาก ${payload.new.guest_name}`,
            time: new Date()
          }, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.replace('/admin/', '');
    const item = navItems.find(i => i.path === path);
    return item?.label || 'แดชบอร์ด';
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
            <h2 className="text-xl font-bold text-[#1a1a1a]">{getPageTitle()}</h2>
            <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span>แอดมิน</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#1a1a1a]">{getPageTitle()}</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา..."
              className="bg-transparent border-none outline-none text-sm w-48"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <Button
            size="sm"
            className="bg-[#c9a962] hover:bg-[#d4b978] hidden sm:flex"
            onClick={() => window.location.href = '/admin/bookings'}
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const success = await login(username, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
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
      <div className="hidden lg:flex lg:w-1/2 bg-[#c9a962] text-white flex-col justify-center p-12 relative overflow-hidden">
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
            <h1 className="text-2xl font-bold font-serif text-[#1e3a5f]">YadaHomestay</h1>
            <p className="text-[#c9a962]">ระบบจัดการ</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">เข้าสู่ระบบ</h2>
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
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-[#1e3a5f]"
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
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] pr-12"
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
                className="w-full bg-[#c9a962] hover:bg-[#e2c075] text-white py-3 rounded-lg font-medium"
                disabled={loading}
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            {/* Test Accounts */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3">ข้อมูลทดลอง:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>เจ้าของ</span>
                  <span className="font-mono font-medium">owner@yadahomestay.com</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>รหัสผ่าน</span>
                  <span className="font-mono font-medium">password</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>แอดมิน</span>
                  <span className="font-mono font-medium">admin@yadahomestay.com</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>รหัสผ่าน</span>
                  <span className="font-mono font-medium">password</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>พนักงานต้อนรับ</span>
                  <span className="font-mono font-medium">reception@yadahomestay.com</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>รหัสผ่าน</span>
                  <span className="font-mono font-medium">password</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">* ใช้บัญชี Supabase ที่สมัครไว้</p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-[#c9a962] flex items-center justify-center gap-2">
              ← กลับไปหน้าหลัก
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Layout
function DashboardLayout() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/cleaning" element={<RoomCleaning />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/bar" element={<Bar />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#c9a962] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <DashboardLayout />;
}

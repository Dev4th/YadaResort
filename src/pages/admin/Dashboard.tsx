import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Bed,
  CreditCard,
  Clock,
  ArrowRight,
  Coffee,
  RefreshCw,
  LogIn,
  LogOut,
  Users,
  Sparkles,
  Wrench,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/admin/PageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { roomStatusConfig as sharedRoomStatus, bookingStatusConfig } from '@/lib/statusConfig';
import {
  useDashboardStore,
  useBookingStore,
  useRoomStore,
  useOrderStore,
} from '@/stores/store';
import api from '@/lib/api';

const statsCards = [
  { key: 'todayCheckIns', label: 'Check-in วันนี้', icon: LogIn, color: 'admin-card-info' },
  { key: 'todayCheckOuts', label: 'Check-out วันนี้', icon: LogOut, color: 'admin-card-warning' },
  { key: 'occupiedRooms', label: 'ห้องที่ใช้งาน', icon: Users, color: 'admin-card-primary' },
  { key: 'availableRooms', label: 'ห้องว่าง', icon: Bed, color: 'admin-card-success' },
  { key: 'todayRevenue', label: 'รายได้วันนี้', icon: CreditCard, color: 'admin-card-accent', format: 'currency' },
  { key: 'pendingOrders', label: 'ออเดอร์รอดำเนินการ', icon: Coffee, color: 'admin-card-danger' },
];

const roomStatusConfig = {
  available: { label: sharedRoomStatus.available.label, color: 'bg-emerald-500', dotColor: 'bg-emerald-400' },
  occupied: { label: sharedRoomStatus.occupied.label, color: 'bg-yada-primary', dotColor: 'bg-yada-primary' },
  cleaning: { label: sharedRoomStatus.cleaning.label, color: 'bg-amber-500', dotColor: 'bg-amber-400' },
  maintenance: { label: sharedRoomStatus.maintenance.label, color: 'bg-rose-500', dotColor: 'bg-rose-400' },
  reserved: { label: sharedRoomStatus.reserved.label, color: 'bg-yada-accent', dotColor: 'bg-yada-accent' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingSlips, setPendingSlips] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const { stats, refreshStats, fetchStats, loading } = useDashboardStore();
  const { getTodayCheckIns, getTodayCheckOuts, fetchBookings, updateBookingStatus } = useBookingStore();
  const { rooms, fetchRooms, updateRoomStatus } = useRoomStore();
  const { getPendingOrders, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    fetchOrders();
    fetchStats();
    api.get('/audit-logs', { params: { limit: 5 } })
      .then((res) => setRecentActivity(res.data || []))
      .catch(() => setRecentActivity([]));
    api.get('/payment-slips', { params: { status: 'pending' } })
      .then((res) => setPendingSlips((res.data || []).length))
      .catch(() => setPendingSlips(0));
    api.get('/products')
      .then((res) => {
        const low = (res.data || []).filter(
          (p: { stock: number; min_stock?: number }) => p.stock <= (p.min_stock ?? 5)
        ).length;
        setLowStockCount(low);
      })
      .catch(() => setLowStockCount(0));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
      fetchBookings();
      fetchRooms();
      api.get('/payment-slips', { params: { status: 'pending' } })
        .then((res) => setPendingSlips((res.data || []).length))
        .catch(() => {});
    }, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshStats, fetchBookings, fetchRooms]);

  const todayCheckIns = getTodayCheckIns();
  const todayCheckOuts = getTodayCheckOuts();
  const pendingOrders = getPendingOrders();

  const formatValue = (key: string, value: number) => {
    if (key === 'todayRevenue' || key === 'monthlyRevenue') {
      return `฿${value.toLocaleString()}`;
    }
    return value.toString();
  };

  // Group rooms by status
  const roomsByStatus = {
    available: rooms.filter((r) => r.status === 'available'),
    occupied: rooms.filter((r) => r.status === 'occupied'),
    cleaning: rooms.filter((r) => r.status === 'cleaning'),
    maintenance: rooms.filter((r) => r.status === 'maintenance'),
  };

  const operations = [
    {
      label: 'งานเช็กอิน',
      value: todayCheckIns.length,
      helper: 'แขกที่มาถึงวันนี้',
      icon: LogIn,
      href: '/admin/bookings',
      tone: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      label: 'งานเช็กเอาท์',
      value: todayCheckOuts.length,
      helper: 'ห้องที่ต้องส่งต่อแม่บ้าน',
      icon: LogOut,
      href: '/admin/bookings',
      tone: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      label: 'รอทำความสะอาด',
      value: roomsByStatus.cleaning.length,
      helper: 'ควรปิดงานก่อนขายต่อ',
      icon: Sparkles,
      href: '/admin/cleaning',
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      label: 'ซ่อมบำรุง',
      value: roomsByStatus.maintenance.length,
      helper: 'ห้องที่กระทบ availability',
      icon: Wrench,
      href: '/admin/maintenance',
      tone: 'bg-rose-50 text-rose-700 border-rose-100',
    },
  ];

  // Handle Check-in
  const handleCheckIn = async (booking: any) => {
    try {
      await updateBookingStatus(booking.id, 'checked-in');
      await updateRoomStatus(booking.room_id, 'occupied');
      await fetchRooms();
      await fetchBookings();
      await fetchStats();
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  // Handle Check-out
  const handleCheckOut = async (booking: any) => {
    try {
      await updateBookingStatus(booking.id, 'checked-out');
      await updateRoomStatus(booking.room_id, 'cleaning');
      await fetchRooms();
      await fetchBookings();
      await fetchStats();
    } catch (error) {
      console.error('Check-out error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="แดชบอร์ด"
        subtitle="ภาพรวมการดำเนินงานของโฮมสเตย์"
        actions={
          <Button variant="yada-outline" onClick={refreshStats} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรชข้อมูล
          </Button>
        }
      />

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-yada-dark via-yada-primary to-yada-primary-hover text-white shadow-sm">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_1.9fr]">
            <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2 text-yada-primary-light">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em]">Today Command Center</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">งานที่ต้องเห็นก่อนเริ่มวัน</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                รวม check-in, check-out, ห้องรอแม่บ้าน และซ่อมบำรุงไว้ในบล็อกเดียว เพื่อให้ทีมต้อนรับตัดสินใจเร็วขึ้น
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" variant="yada" onClick={() => navigate('/admin/bookings?walkIn=1')}>
                  + จอง Walk-in
                </Button>
                {pendingSlips > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    onClick={() => navigate('/admin/payment-verify')}
                  >
                    สลิปรอตรวจ {pendingSlips}
                  </Button>
                )}
                {lowStockCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
                    onClick={() => navigate('/admin/inventory')}
                  >
                    สต็อกใกล้หมด {lowStockCount}
                  </Button>
                )}
                <Button size="sm" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white hover:text-yada-text" onClick={() => navigate('/admin/calendar')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  ปฏิทิน
                </Button>
              </div>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
              {operations.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${item.tone}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5" />
                      <span className="text-2xl font-bold">{item.value}</span>
                    </div>
                    <p className="mt-4 font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs opacity-75">{item.helper}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats] as number;
          return (
            <AdminStatCard
              key={card.key}
              label={card.label}
              value={formatValue(card.key, value)}
              icon={Icon}
              gradient={card.color}
            />
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Check-ins */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-blue-500" />
                  Check-in วันนี้ ({todayCheckIns.length})
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/bookings')}>
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayCheckIns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ไม่มีการ Check-in วันนี้</p>
              ) : (
                <div className="space-y-3">
                  {todayCheckIns.map((booking) => {
                    const room = rooms.find((r) => r.id === booking.room_id);
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{booking.guest_name}</p>
                          <p className="text-sm text-gray-500">
                            ห้อง {room?.name_th || room?.name}
                          </p>
                        </div>
                        {booking.status === 'checked-in' ? (
                          <Badge className={bookingStatusConfig['checked-in'].color}>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {bookingStatusConfig['checked-in'].label}
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() => handleCheckIn(booking)}
                          >
                            Check-in
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Check-outs */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-orange-500" />
                  Check-out วันนี้ ({todayCheckOuts.length})
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/bookings')}>
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayCheckOuts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ไม่มีการ Check-out วันนี้</p>
              ) : (
                <div className="space-y-3">
                  {todayCheckOuts.map((booking) => {
                    const room = rooms.find((r) => r.id === booking.room_id);
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{booking.guest_name}</p>
                          <p className="text-sm text-gray-500">
                            ห้อง {room?.name_th || room?.name}
                          </p>
                        </div>
                        {booking.status === 'checked-out' ? (
                          <Badge className={bookingStatusConfig['checked-out'].color}>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {bookingStatusConfig['checked-out'].label}
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCheckOut(booking)}
                          >
                            Check-out
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Status Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bed className="w-5 h-5 text-yada-primary" />
                  สถานะห้องพัก
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/rooms')}>
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Status Legend */}
              <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
                {Object.entries(roomStatusConfig).map(([status, config]) => {
                  const count = roomsByStatus[status as keyof typeof roomsByStatus]?.length || 0;
                  if (count === 0) return null;
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${config.dotColor}`} />
                      <span className="text-sm text-gray-600">{config.label}</span>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Room Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {rooms.map((room) => {
                  const statusConfig = roomStatusConfig[room.status as keyof typeof roomStatusConfig] || roomStatusConfig.available;
                  // Extract room number from name (e.g., "Deluxe 101" -> "101") or use last 3 chars of id
                  const roomNumber = room.name?.match(/\d+/)?.[0] || room.name_th?.match(/\d+/)?.[0] || room.id.slice(-3);
                  return (
                    <div
                      key={room.id}
                      className="relative p-3 bg-white border-2 rounded-lg hover:shadow-md transition-shadow cursor-pointer min-h-[60px] flex items-center justify-center"
                      onClick={() => navigate('/admin/rooms')}
                      title={`${room.name_th || room.name} - ${statusConfig.label}`}
                    >
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${statusConfig.dotColor}`} />
                      <p className="text-center font-bold text-lg text-gray-700">{roomNumber}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Room Status Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bed className="w-5 h-5 text-green-500" />
                สรุปสถานะห้องพัก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-gray-600">ว่าง</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {roomsByStatus.available.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span className="text-gray-600">มีผู้เข้าพัก</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {roomsByStatus.occupied.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    <span className="text-gray-600">ทำความสะอาด</span>
                  </div>
                  <span className="font-semibold text-orange-600">
                    {roomsByStatus.cleaning.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="text-gray-600">ซ่อมบำรุง</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    {roomsByStatus.maintenance.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coffee className="w-5 h-5 text-red-500" />
                ออเดอร์รอดำเนินการ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ไม่มีออเดอร์รอดำเนินการ</p>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="p-3 bg-yada-sand/60 hover:bg-yada-sand rounded-lg cursor-pointer transition-colors duration-150"
                      onClick={() => navigate('/admin/bar')}
                    >
                      <p className="font-medium">{order.guest_name}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} รายการ - ฿{order.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-yada-primary" />
                กิจกรรมล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีกิจกรรมล่าสุด</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="rounded-lg bg-yada-sand/70 p-3">
                      <p className="text-sm font-semibold text-yada-text">{item.action}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.table_name} · {item.user?.name || 'ลูกค้า'} · {new Date(item.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Revenue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yada-accent" />
                รายได้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">วันนี้</span>
                  <span className="font-medium text-lg">฿{stats.todayRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">เดือนนี้</span>
                  <span className="font-medium text-lg">฿{stats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/admin/reports')}
              >
                ดูรายงานเพิ่มเติม
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

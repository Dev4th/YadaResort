import { useEffect } from 'react';
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
import {
  useDashboardStore,
  useBookingStore,
  useRoomStore,
  useOrderStore,
} from '@/stores/supabaseStore';

const statsCards = [
  { key: 'todayCheckIns', label: 'Check-in วันนี้', icon: LogIn, color: 'bg-blue-500' },
  { key: 'todayCheckOuts', label: 'Check-out วันนี้', icon: LogOut, color: 'bg-orange-500' },
  { key: 'occupiedRooms', label: 'ห้องที่ใช้งาน', icon: Users, color: 'bg-resort-primary' },
  { key: 'availableRooms', label: 'ห้องว่าง', icon: Bed, color: 'bg-green-500' },
  { key: 'todayRevenue', label: 'รายได้วันนี้', icon: CreditCard, color: 'bg-resort-accent', format: 'currency' },
  { key: 'pendingOrders', label: 'ออเดอร์รอดำเนินการ', icon: Coffee, color: 'bg-red-500' },
];

const roomStatusConfig = {
  available: { label: 'ว่าง', color: 'bg-green-500', dotColor: 'bg-green-400' },
  occupied: { label: 'มีผู้เข้าพัก', color: 'bg-blue-500', dotColor: 'bg-blue-400' },
  cleaning: { label: 'ทำความสะอาด', color: 'bg-orange-500', dotColor: 'bg-orange-400' },
  maintenance: { label: 'ซ่อมบำรุง', color: 'bg-red-500', dotColor: 'bg-red-400' },
  reserved: { label: 'จองแล้ว', color: 'bg-purple-500', dotColor: 'bg-purple-400' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, refreshStats, fetchStats, loading } = useDashboardStore();
  const { getTodayCheckIns, getTodayCheckOuts, fetchBookings, updateBooking } = useBookingStore();
  const { rooms, fetchRooms, updateRoomStatus } = useRoomStore();
  const { getPendingOrders, fetchOrders } = useOrderStore();

  useEffect(() => {
    // Fetch all data on mount
    fetchRooms();
    fetchBookings();
    fetchOrders();
    fetchStats();
  }, []);

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
    reserved: rooms.filter((r) => r.status === 'reserved'),
  };

  // Handle Check-in
  const handleCheckIn = async (booking: any) => {
    try {
      await updateBooking(booking.id, { status: 'checked-in' });
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
      await updateBooking(booking.id, { status: 'checked-out' });
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-resort-text">แดชบอร์ด</h1>
          <p className="text-resort-text-secondary">ภาพรวมการดำเนินงานของโฮมสเตย์</p>
        </div>
        <Button variant="outline" onClick={refreshStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats] as number;
          
          return (
            <Card key={card.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">{formatValue(card.key, value)}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </CardContent>
            </Card>
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
                            ห้อง {room?.number || room?.name_th}
                          </p>
                        </div>
                        {booking.status === 'checked-in' ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            เช็คอินแล้ว
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
                            ห้อง {room?.number || room?.name_th}
                          </p>
                        </div>
                        {booking.status === 'checked-out' ? (
                          <Badge className="bg-gray-100 text-gray-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            เช็คเอาท์แล้ว
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
                  <Bed className="w-5 h-5 text-resort-primary" />
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
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
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

          {/* Quick Revenue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-resort-accent" />
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

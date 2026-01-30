import { useEffect } from 'react';
import {
  Calendar,
  Bed,
  CreditCard,
  Clock,
  ArrowRight,
  Coffee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useDashboardStore,
  useBookingStore,
  useRoomStore,
  useOrderStore,
} from '@/stores/supabaseStore';

const statsCards = [
  { key: 'todayCheckIns', label: 'Check-in วันนี้', icon: Calendar, color: 'bg-blue-500' },
  { key: 'todayCheckOuts', label: 'Check-out วันนี้', icon: Clock, color: 'bg-orange-500' },
  { key: 'occupiedRooms', label: 'ห้องที่ใช้งาน', icon: Bed, color: 'bg-resort-primary' },
  { key: 'availableRooms', label: 'ห้องว่าง', icon: Bed, color: 'bg-purple-500' },
  { key: 'todayRevenue', label: 'รายได้วันนี้', icon: CreditCard, color: 'bg-resort-accent', format: 'currency' },
  { key: 'pendingOrders', label: 'ออเดอร์รอดำเนินการ', icon: Coffee, color: 'bg-red-500' },
];

export default function Dashboard() {
  const { stats, refreshStats, fetchStats } = useDashboardStore();
  const { getTodayCheckIns, getTodayCheckOuts, fetchBookings, bookings } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { getPendingOrders, fetchOrders, orders } = useOrderStore();

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-resort-text">แดชบอร์ด</h1>
          <p className="text-resort-text-secondary">ภาพรวมการดำเนินงานของโฮมสเตย์</p>
        </div>
        <Button variant="outline" onClick={refreshStats}>
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
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Check-in วันนี้ ({todayCheckIns.length})
                </CardTitle>
                <Button variant="ghost" size="sm">
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayCheckIns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ไม่มีการ Check-in วันนี้</p>
              ) : (
                <div className="space-y-3">
                  {todayCheckIns.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{booking.guest_name}</p>
                        <p className="text-sm text-gray-500">
                          ห้อง {rooms.find((r) => r.id === booking.room_id)?.name_th}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Check-in
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Check-outs */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Check-out วันนี้ ({todayCheckOuts.length})
                </CardTitle>
                <Button variant="ghost" size="sm">
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayCheckOuts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ไม่มีการ Check-out วันนี้</p>
              ) : (
                <div className="space-y-3">
                  {todayCheckOuts.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{booking.guest_name}</p>
                        <p className="text-sm text-gray-500">
                          ห้อง {rooms.find((r) => r.id === booking.room_id)?.name_th}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Check-out
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Room Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bed className="w-5 h-5 text-green-500" />
                สถานะห้องพัก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ว่าง</span>
                  <span className="font-medium text-green-600">
                    {rooms.filter((r) => r.status === 'available').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">เต็ม</span>
                  <span className="font-medium text-red-600">
                    {rooms.filter((r) => r.status === 'occupied').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ทำความสะอาด</span>
                  <span className="font-medium text-blue-600">
                    {rooms.filter((r) => r.status === 'cleaning').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ซ่อมบำรุง</span>
                  <span className="font-medium text-yellow-600">
                    {rooms.filter((r) => r.status === 'maintenance').length}
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
                      className="p-3 bg-gray-50 rounded-lg"
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
                  <span className="font-medium">฿{stats.todayRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">เดือนนี้</span>
                  <span className="font-medium">฿{stats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

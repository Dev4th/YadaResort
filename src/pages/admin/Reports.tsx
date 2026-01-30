import { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, Users, Bed, Coffee, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookingStore, useRoomStore, useOrderStore, useDashboardStore, useProductStore } from '@/stores/supabaseStore';
import { supabase } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { th } from 'date-fns/locale';

const COLORS = ['#2F5D50', '#4ade80', '#60a5fa', '#f87171', '#a78bfa'];

export default function Reports() {
  const { bookings, fetchBookings } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { orders, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { stats, fetchStats } = useDashboardStore();
  const [period, setPeriod] = useState('month');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBookings(),
        fetchRooms(),
        fetchOrders(),
        fetchProducts(),
        fetchStats(),
      ]);
      await fetchRevenueData();
      setLoading(false);
    };
    loadData();
  }, [fetchBookings, fetchRooms, fetchOrders, fetchProducts, fetchStats]);

  // Fetch revenue data from payments
  const fetchRevenueData = async () => {
    const monthlyData: any[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Get room revenue from bookings
      const { data: roomPayments } = await supabase
        .from('payments')
        .select('amount, booking_id')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
        .eq('status', 'completed')
        .not('booking_id', 'is', null);
      
      // Get F&B revenue from orders
      const { data: fnbPayments } = await supabase
        .from('payments')
        .select('amount, order_id')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
        .eq('status', 'completed')
        .not('order_id', 'is', null);
      
      const roomRevenue = roomPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const fnbRevenue = fnbPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      monthlyData.push({
        name: format(monthDate, 'MMM', { locale: th }),
        room: roomRevenue,
        fnb: fnbRevenue,
      });
    }
    
    setRevenueData(monthlyData);
  };

  // Calculate occupancy data from bookings (last 7 days)
  const occupancyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).slice(0, 7);
    const totalRooms = rooms.length || 1;
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const occupiedCount = bookings.filter(b => {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        const checkDay = new Date(dayStr);
        return checkIn <= checkDay && checkOut > checkDay && 
               (b.status === 'confirmed' || b.status === 'checked-in');
      }).length;
      
      return {
        name: format(day, 'E', { locale: th }),
        rate: Math.round((occupiedCount / totalRooms) * 100),
      };
    });
  }, [bookings, rooms]);

  // Calculate room type distribution from actual bookings
  const roomTypeData = useMemo(() => {
    const roomBookings: Record<string, number> = {};
    
    bookings.forEach(booking => {
      const room = rooms.find(r => r.id === booking.room_id);
      if (room) {
        const roomType = room.name?.toLowerCase().includes('deluxe') ? 'ห้องดีลักซ์' :
                        room.name?.toLowerCase().includes('family') || room.name?.toLowerCase().includes('suite') ? 'ห้องแฟมิลี่' :
                        room.name?.toLowerCase().includes('villa') ? 'ห้องวิลล่า' : 'ห้องมาตรฐาน';
        roomBookings[roomType] = (roomBookings[roomType] || 0) + 1;
      }
    });
    
    return Object.entries(roomBookings).map(([name, value]) => ({ name, value }));
  }, [bookings, rooms]);

  // Calculate top products from orders
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            if (!productSales[product.id]) {
              productSales[product.id] = { name: product.name_th || product.name, sales: 0, revenue: 0 };
            }
            productSales[product.id].sales += item.quantity || 0;
            productSales[product.id].revenue += (item.quantity || 0) * (product.price || 0);
          }
        });
      }
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-resort-text">รายงาน</h1>
          <p className="text-gray-500">วิเคราะห์ข้อมูลและสถิติการดำเนินงาน</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">วันนี้</SelectItem>
              <SelectItem value="week">สัปดาห์นี้</SelectItem>
              <SelectItem value="month">เดือนนี้</SelectItem>
              <SelectItem value="year">ปีนี้</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            ส่งออก
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-resort-accent">
                  ฿{stats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">รายได้รวม</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-resort-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-resort-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {bookings.length}
                </p>
                <p className="text-sm text-gray-500">การจองทั้งหมด</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((rooms.filter((r) => r.status === 'occupied').length / rooms.length) * 100)}%
                </p>
                <p className="text-sm text-gray-500">อัตราการเข้าพัก</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Bed className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.length}
                </p>
                <p className="text-sm text-gray-500">ออเดอร์ F&B</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue">
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="revenue">รายได้</TabsTrigger>
          <TabsTrigger value="occupancy">อัตราการเข้าพัก</TabsTrigger>
          <TabsTrigger value="rooms">ประเภทห้อง</TabsTrigger>
          <TabsTrigger value="products">สินค้าขายดี</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-6">รายได้รายเดือน</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `฿${value.toLocaleString()}`}
                    />
                    <Bar dataKey="room" name="ห้องพัก" fill="#2F5D50" />
                    <Bar dataKey="fnb" name="F&B" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-6">อัตราการเข้าพักรายสัปดาห์</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#2F5D50"
                      strokeWidth={2}
                      dot={{ fill: '#2F5D50' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-6">สัดส่วนประเภทห้องพัก</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roomTypeData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-6">สินค้าขายดี</h3>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-resort-primary text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          ขายได้ {product.sales} รายการ
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-resort-accent">
                      ฿{product.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

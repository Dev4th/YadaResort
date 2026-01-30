import { useState, useEffect } from 'react';
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
import { useBookingStore, useRoomStore, useOrderStore, useDashboardStore } from '@/stores/supabaseStore';
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

const COLORS = ['#c9a962', '#4ade80', '#60a5fa', '#f87171', '#a78bfa'];

export default function Reports() {
  const { bookings, fetchBookings } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { orders, fetchOrders } = useOrderStore();
  const { stats, fetchStats } = useDashboardStore();
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchBookings();
    fetchRooms();
    fetchOrders();
    fetchStats();
  }, [fetchBookings, fetchRooms, fetchOrders, fetchStats]);

  // Mock data for charts
  const revenueData = [
    { name: 'ม.ค.', room: 120000, fnb: 25000 },
    { name: 'ก.พ.', room: 135000, fnb: 30000 },
    { name: 'มี.ค.', room: 150000, fnb: 35000 },
    { name: 'เม.ย.', room: 140000, fnb: 28000 },
    { name: 'พ.ค.', room: 160000, fnb: 40000 },
    { name: 'มิ.ย.', room: 180000, fnb: 45000 },
  ];

  const occupancyData = [
    { name: 'อา.', rate: 65 },
    { name: 'จ.', rate: 45 },
    { name: 'อ.', rate: 55 },
    { name: 'พ.', rate: 70 },
    { name: 'พฤ.', rate: 75 },
    { name: 'ศ.', rate: 85 },
    { name: 'ส.', rate: 90 },
  ];

  const roomTypeData = [
    { name: 'ห้องมาตรฐาน', value: 45 },
    { name: 'ห้องดีลักซ์', value: 30 },
    { name: 'ห้องแฟมิลี่', value: 15 },
    { name: 'ห้องวิลล่า', value: 10 },
  ];

  const topProducts = [
    { name: 'ชาเย็น', sales: 150, revenue: 9000 },
    { name: 'น้ำมะพร้าว', sales: 120, revenue: 6000 },
    { name: 'เบียร์สิงห์', sales: 80, revenue: 9600 },
    { name: 'ลาเต้', sales: 75, revenue: 6375 },
    { name: 'เอสเพรสโซ่', sales: 60, revenue: 4200 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">รายงาน</h1>
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
                <p className="text-2xl font-bold text-[#c9a962]">
                  ฿{stats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">รายได้รวม</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#c9a962]" />
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
                    <Bar dataKey="room" name="ห้องพัก" fill="#c9a962" />
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
                      stroke="#c9a962"
                      strokeWidth={2}
                      dot={{ fill: '#c9a962' }}
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
                      <span className="w-8 h-8 rounded-full bg-[#c9a962] text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          ขายได้ {product.sales} รายการ
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#c9a962]">
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

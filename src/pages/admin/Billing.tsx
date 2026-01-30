import { useState, useEffect } from 'react';
import { Search, CreditCard, FileText, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBookingStore, useRoomStore, useOrderStore } from '@/stores/supabaseStore';

export default function Billing() {
  const { bookings, fetchBookings } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { orders, fetchOrders } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchRooms();
    fetchOrders();
  }, [fetchBookings, fetchRooms, fetchOrders]);

  // Get active bookings (checked-in or confirmed)
  const activeBookings = bookings.filter(
    (b) =>
      (b.status === 'checked-in' || b.status === 'confirmed') &&
      (b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guest_phone?.includes(searchQuery))
  );

  const getBookingOrders = (bookingId: string) => {
    return orders.filter((o) => o.booking_id === bookingId);
  };

  const calculateStay = (checkIn: Date, checkOut: Date) => {
    const diffTime = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">การเงิน</h1>
        <p className="text-gray-500">จัดการการชำระเงินและออกใบเสร็จ</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ค้นหาชื่อหรือเบอร์โทร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="grid gap-4">
        {activeBookings.map((booking) => {
          const room = rooms.find((r) => r.id === booking.room_id);
          const bookingOrders = getBookingOrders(booking.id);
          const orderTotal = bookingOrders.reduce((sum, o) => sum + o.total, 0);
          const nights = calculateStay(booking.check_in, booking.check_out);
          const roomTotal = room ? room.price * nights : 0;
          const grandTotal = roomTotal + orderTotal;

          return (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{booking.guest_name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'checked-in'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {booking.status === 'checked-in' ? 'เข้าพักอยู่' : 'ยืนยันแล้ว'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>{room?.name_th}</span>
                      <span>•</span>
                      <span>{nights} คืน</span>
                      <span>•</span>
                      <span>
                        {new Date(booking.check_in).toLocaleDateString('th-TH')} -{' '}
                        {new Date(booking.check_out).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">ยอดรวม</p>
                      <p className="text-xl font-bold text-[#c9a962]">
                        ฿{grandTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking({
                            ...booking,
                            room,
                            nights,
                            roomTotal,
                            orderTotal,
                            grandTotal,
                            orders: bookingOrders,
                          });
                          setDetailOpen(true);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        ดูบิล
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#c9a962] hover:bg-[#d4b978]"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        ชำระเงิน
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {activeBookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>ไม่พบรายการที่ต้องชำระเงิน</p>
          </div>
        )}
      </div>

      {/* Bill Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>ใบแจ้งหนี้ / ใบเสร็จ</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold font-serif">Yada Homestay</h2>
                  <p className="text-gray-500">80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000</p>
                  <p className="text-gray-500">โทร: 081-234-5678</p>
                </div>

                {/* Guest Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ลูกค้า</p>
                    <p className="font-medium">{selectedBooking.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">เบอร์โทร</p>
                    <p className="font-medium">{selectedBooking.guest_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">วันที่เข้าพัก</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.check_in).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">วันออก</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.check_out).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>

                {/* Room Charges */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">ค่าห้องพัก</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>
                        {selectedBooking.room?.name_th} x {selectedBooking.nights} คืน
                      </span>
                      <span>฿{selectedBooking.roomTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Charges */}
                {selectedBooking.orders.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">ค่าบริการเพิ่มเติม</h4>
                    <div className="space-y-2">
                      {selectedBooking.orders.map((order: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            ออเดอร์ #{order.id.slice(-4)} ({order.items.length} รายการ)
                          </span>
                          <span>฿{order.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>รวมทั้งสิ้น</span>
                    <span className="text-[#c9a962]">
                      ฿{selectedBooking.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">สถานะการชำระเงิน</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedBooking.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : selectedBooking.payment_status === 'partial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedBooking.payment_status === 'paid'
                        ? 'ชำระแล้ว'
                        : selectedBooking.payment_status === 'partial'
                        ? 'ชำระบางส่วน'
                        : 'รอชำระ'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Printer className="w-4 h-4 mr-2" />
                    พิมพ์
                  </Button>
                  {selectedBooking.payment_status !== 'paid' && (
                    <Button className="flex-1 bg-[#c9a962] hover:bg-[#d4b978]">
                      <CreditCard className="w-4 h-4 mr-2" />
                      ชำระเงิน
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Search, CreditCard, FileText, Printer, Check, Download, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookingStore, useRoomStore, useOrderStore, useSettingsStore } from '@/stores/supabaseStore';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function Billing() {
  const { bookings, fetchBookings, updateBookingStatus } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { orders, fetchOrders } = useOrderStore();
  const { settings } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

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

  // Handle payment
  const handlePayment = async () => {
    if (!selectedBooking) return;
    
    setProcessing(true);
    try {
      // Create payment record
      await supabase.from('payments').insert({
        booking_id: selectedBooking.id,
        amount: selectedBooking.grandTotal,
        method: paymentMethod,
        status: 'completed',
        notes: `ชำระเงินโดย ${paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'transfer' ? 'โอนเงิน' : 'บัตรเครดิต'}`
      });

      // Update booking payment status
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid', payment_method: paymentMethod })
        .eq('id', selectedBooking.id);

      // Refresh data
      fetchBookings();
      setPaymentOpen(false);
      setDetailOpen(false);
      alert('บันทึกการชำระเงินสำเร็จ');
    } catch (error) {
      console.error('Payment error:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setProcessing(false);
    }
  };

  // Print invoice
  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const invoiceContent = printRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ใบเสร็จ - ${selectedBooking?.guest_name}</title>
        <style>
          body { font-family: 'Sarabun', sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .info-grid p { margin: 0; }
          .info-grid .label { color: #666; font-size: 12px; }
          .info-grid .value { font-weight: 600; }
          .items { border-top: 1px solid #ddd; padding-top: 15px; }
          .items h4 { margin: 0 0 10px; }
          .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #333; margin-top: 15px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${invoiceContent}
        <div class="footer">
          <p>ขอบคุณที่ใช้บริการ</p>
          <p>Yada Homestay | ${settings.phone || '081-234-5678'}</p>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-resort-text">การเงิน</h1>
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
                      <p className="text-xl font-bold text-resort-accent">
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
                        className="bg-resort-primary hover:bg-resort-primary-hover"
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
                          setPaymentOpen(true);
                        }}
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
              
              {/* Printable Content */}
              <div ref={printRef} className="space-y-6">
                {/* Header */}
                <div className="header text-center border-b pb-4">
                  <h1 className="text-2xl font-bold font-serif">{settings.name || 'Yada Homestay'}</h1>
                  <p className="text-gray-500">{settings.address || '80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000'}</p>
                  <p className="text-gray-500">โทร: {settings.phone || '081-234-5678'}</p>
                  {settings.taxId && <p className="text-gray-500 text-sm">เลขประจำตัวผู้เสียภาษี: {settings.taxId}</p>}
                </div>

                {/* Invoice Info */}
                <div className="info-grid grid grid-cols-2 gap-4">
                  <div>
                    <p className="label text-sm text-gray-500">ลูกค้า</p>
                    <p className="value font-medium">{selectedBooking.guest_name}</p>
                  </div>
                  <div>
                    <p className="label text-sm text-gray-500">เบอร์โทร</p>
                    <p className="value font-medium">{selectedBooking.guest_phone}</p>
                  </div>
                  <div>
                    <p className="label text-sm text-gray-500">วันที่เข้าพัก</p>
                    <p className="value font-medium">
                      {format(new Date(selectedBooking.check_in), 'd MMM yyyy', { locale: th })}
                    </p>
                  </div>
                  <div>
                    <p className="label text-sm text-gray-500">วันออก</p>
                    <p className="value font-medium">
                      {format(new Date(selectedBooking.check_out), 'd MMM yyyy', { locale: th })}
                    </p>
                  </div>
                  <div>
                    <p className="label text-sm text-gray-500">เลขที่ใบเสร็จ</p>
                    <p className="value font-medium font-mono">INV-{selectedBooking.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="label text-sm text-gray-500">วันที่ออกใบเสร็จ</p>
                    <p className="value font-medium">{format(new Date(), 'd MMM yyyy', { locale: th })}</p>
                  </div>
                </div>

                {/* Room Charges */}
                <div className="items border-t pt-4">
                  <h4 className="font-semibold mb-3">ค่าห้องพัก</h4>
                  <div className="space-y-2">
                    <div className="item-row flex justify-between py-2 border-b">
                      <span>
                        {selectedBooking.room?.name_th} x {selectedBooking.nights} คืน
                        <span className="text-sm text-gray-500 ml-2">
                          (@฿{selectedBooking.room?.price?.toLocaleString()}/คืน)
                        </span>
                      </span>
                      <span>฿{selectedBooking.roomTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Charges */}
                {selectedBooking.orders.length > 0 && (
                  <div className="items border-t pt-4">
                    <h4 className="font-semibold mb-3">ค่าบริการเพิ่มเติม</h4>
                    <div className="space-y-2">
                      {selectedBooking.orders.map((order: any, idx: number) => (
                        <div key={idx} className="item-row flex justify-between py-2 border-b">
                          <span>
                            ออเดอร์ #{order.id.slice(-4)} ({order.items?.length || 0} รายการ)
                          </span>
                          <span>฿{order.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="total-row border-t-2 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>รวมทั้งสิ้น</span>
                    <span className="text-resort-accent">
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
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  พิมพ์ใบเสร็จ
                </Button>
                {selectedBooking.payment_status !== 'paid' && (
                  <Button 
                    className="flex-1 bg-resort-primary hover:bg-resort-primary-hover"
                    onClick={() => {
                      setDetailOpen(false);
                      setPaymentOpen(true);
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    ชำระเงิน
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-md">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>ชำระเงิน</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedBooking.guest_name}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.room?.name_th}</p>
                    </div>
                    <p className="text-2xl font-bold text-resort-accent">
                      ฿{selectedBooking.grandTotal?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">วิธีชำระเงิน</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">เงินสด</SelectItem>
                      <SelectItem value="transfer">โอนเงิน</SelectItem>
                      <SelectItem value="credit">บัตรเครดิต</SelectItem>
                      <SelectItem value="promptpay">พร้อมเพย์</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setPaymentOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handlePayment}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        ยืนยันชำระเงิน
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

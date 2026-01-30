import { useState, useEffect } from 'react';
import { Search, Calendar, User, Bed, Check, X, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBookingStore, useRoomStore } from '@/stores/supabaseStore';

const paymentMethods = [
  { id: 'cash', name: 'เงินสด', icon: Banknote },
  { id: 'card', name: 'บัตรเครดิต', icon: CreditCard },
  { id: 'qr', name: 'QR Code', icon: QrCode },
];

export default function POS() {
  const { bookings, checkIn, checkOut, fetchBookings } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cash');

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, [fetchBookings, fetchRooms]);

  // Filter bookings for today
  const today = new Date().toDateString();
  
  const todayCheckIns = bookings.filter(
    (b) =>
      new Date(b.check_in).toDateString() === today &&
      b.status === 'confirmed' &&
      (b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guest_phone?.includes(searchQuery))
  );

  const todayCheckOuts = bookings.filter(
    (b) =>
      new Date(b.check_out).toDateString() === today &&
      b.status === 'checked-in' &&
      (b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guest_phone?.includes(searchQuery))
  );

  const currentGuests = bookings.filter(
    (b) =>
      b.status === 'checked-in' &&
      (b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guest_phone?.includes(searchQuery))
  );

  const handleCheckIn = (booking: any) => {
    setSelectedBooking(booking);
    setActionType('checkin');
    setPaymentDialogOpen(true);
  };

  const handleCheckOut = (booking: any) => {
    setSelectedBooking(booking);
    setActionType('checkout');
    setPaymentDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedBooking || !actionType) return;

    if (actionType === 'checkin') {
      checkIn(selectedBooking.id);
    } else {
      checkOut(selectedBooking.id);
    }

    setPaymentDialogOpen(false);
    setSelectedBooking(null);
    setActionType(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-resort-text">Check-in / Check-out</h1>
        <p className="text-gray-500">จัดการการเข้าพักและออกของลูกค้า</p>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Check-in Today */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold">Check-in วันนี้</h3>
                <p className="text-sm text-gray-500">{todayCheckIns.length} รายการ</p>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayCheckIns.map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{booking.guest_name}</p>
                      <p className="text-sm text-gray-500">
                        {rooms.find((r) => r.id === booking.room_id)?.name_th}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleCheckIn(booking)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Check-in
                    </Button>
                  </div>
                </div>
              ))}
              {todayCheckIns.length === 0 && (
                <p className="text-gray-500 text-center py-4">ไม่มีรายการ</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Guests */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold">ลูกค้าที่เข้าพักอยู่</h3>
                <p className="text-sm text-gray-500">{currentGuests.length} ห้อง</p>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentGuests.map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{booking.guest_name}</p>
                      <p className="text-sm text-gray-500">
                        {rooms.find((r) => r.id === booking.room_id)?.name_th}
                      </p>
                      <p className="text-xs text-gray-400">
                        ออก: {new Date(booking.check_out).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCheckOut(booking)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Check-out
                    </Button>
                  </div>
                </div>
              ))}
              {currentGuests.length === 0 && (
                <p className="text-gray-500 text-center py-4">ไม่มีรายการ</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Check-out Today */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Bed className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold">Check-out วันนี้</h3>
                <p className="text-sm text-gray-500">{todayCheckOuts.length} รายการ</p>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayCheckOuts.map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{booking.guest_name}</p>
                      <p className="text-sm text-gray-500">
                        {rooms.find((r) => r.id === booking.room_id)?.name_th}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleCheckOut(booking)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Check-out
                    </Button>
                  </div>
                </div>
              ))}
              {todayCheckOuts.length === 0 && (
                <p className="text-gray-500 text-center py-4">ไม่มีรายการ</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'checkin' ? 'ยืนยัน Check-in' : 'ยืนยัน Check-out'}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedBooking.guest_name}</p>
                <p className="text-sm text-gray-500">
                  {rooms.find((r) => r.id === selectedBooking.room_id)?.name_th}
                </p>
                <p className="text-xl font-bold text-resort-accent mt-2">
                  ฿{selectedBooking.total_amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">วิธีการชำระเงิน</p>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedPayment === method.id
                            ? 'border-resort-accent bg-resort-accent/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs">{method.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPaymentDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1 bg-resort-primary hover:bg-resort-primary-hover"
                  onClick={confirmAction}
                >
                  {actionType === 'checkin' ? 'ยืนยัน Check-in' : 'ยืนยัน Check-out'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

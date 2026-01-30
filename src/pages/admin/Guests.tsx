import { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, History, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/supabaseStore';

// Mock guests data derived from bookings
export default function Guests() {
  const { bookings, fetchBookings } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Extract unique guests from bookings
  const guestsMap = new Map();
  bookings.forEach((booking) => {
    const key = booking.guest_phone;
    if (!guestsMap.has(key)) {
      guestsMap.set(key, {
        name: booking.guest_name,
        phone: booking.guest_phone,
        email: booking.guest_email,
        bookings: [],
      });
    }
    guestsMap.get(key).bookings.push(booking);
  });

  const guests = Array.from(guestsMap.values()).map((guest: any) => ({
    ...guest,
    totalVisits: guest.bookings.length,
    lastVisit: guest.bookings.sort(
      (a: any, b: any) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
    )[0],
  }));

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-resort-text">ลูกค้า</h1>
        <p className="text-gray-500">จัดการข้อมูลลูกค้าและประวัติการเข้าพัก</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Guests Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuests.map((guest, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-resort-accent/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-resort-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{guest.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{guest.phone}</span>
                  </div>
                  {guest.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{guest.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-resort-accent">
                    {guest.totalVisits}
                  </p>
                  <p className="text-sm text-gray-500">ครั้งที่เข้าพัก</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">
                    {new Date(guest.lastVisit.check_in).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <p className="text-sm text-gray-500">เข้าพักล่าสุด</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setSelectedGuest(guest);
                  setDetailOpen(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                ดูประวัติ
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>ไม่พบข้อมูลลูกค้า</p>
        </div>
      )}

      {/* Guest Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedGuest && (
            <>
              <DialogHeader>
                <DialogTitle>ประวัติลูกค้า</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Guest Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-resort-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {selectedGuest.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedGuest.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedGuest.phone}
                      </span>
                      {selectedGuest.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedGuest.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-resort-accent">
                      {selectedGuest.totalVisits}
                    </p>
                    <p className="text-sm text-gray-500">ครั้งที่เข้าพัก</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedGuest.bookings.reduce(
                        (sum: number, b: any) => sum + b.total_amount,
                        0
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">ยอดใช้จ่ายรวม (บาท)</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(
                        selectedGuest.bookings.reduce(
                          (sum: number, b: any) =>
                            sum +
                            (new Date(b.check_out).getTime() -
                              new Date(b.check_in).getTime()) /
                              (1000 * 60 * 60 * 24),
                          0
                        ) / selectedGuest.totalVisits
                      )}
                    </p>
                    <p className="text-sm text-gray-500">คืนเฉลี่ย/ครั้ง</p>
                  </div>
                </div>

                {/* Booking History */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    ประวัติการจอง
                  </h4>
                  <div className="space-y-3">
                    {selectedGuest.bookings
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
                      )
                      .map((booking: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                วันที่เข้าพัก:{' '}
                                {new Date(booking.check_in).toLocaleDateString('th-TH')}
                              </p>
                              <p className="text-sm text-gray-500">
                                ถึง{' '}
                                {new Date(booking.check_out).toLocaleDateString('th-TH')} • {' '}
                                {Math.round(
                                  (new Date(booking.check_out).getTime() -
                                    new Date(booking.check_in).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )}{' '}
                                คืน
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-resort-accent">
                                ฿{booking.total_amount.toLocaleString()}
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  booking.status === 'checked-out'
                                    ? 'bg-gray-100 text-gray-600'
                                    : booking.status === 'checked-in'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                {booking.status === 'checked-out'
                                  ? 'เช็คเอาท์แล้ว'
                                  : booking.status === 'checked-in'
                                  ? 'เข้าพักอยู่'
                                  : 'ยืนยันแล้ว'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

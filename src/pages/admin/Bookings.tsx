import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { toast } from 'sonner';
import { Plus, Search, Filter, MoreHorizontal, User, Phone, Check, X, Calendar, Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { bookingStatusConfig } from '@/lib/statusConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { useBookingStore, useRoomStore } from '@/stores/store';

// Generate booking ID from UUID
const generateBookingId = (id: string) => {
  const num = parseInt(id.replace(/-/g, '').slice(0, 6), 16) % 1000000;
  return `BK-${num.toString().padStart(6, '0')}`;
};

// Calculate nights between dates
const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function Bookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookings, checkIn, checkOut, cancelBooking, confirmBooking, fetchBookings, createBooking } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [highlightId, setHighlightId] = useState(searchParams.get('highlight') || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Walk-in booking state
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    room_id: '',
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    check_in: new Date(),
    check_out: new Date(Date.now() + 86400000),
    adults: 1,
    children: 0,
    notes: '',
    payment_method: 'cash' as 'cash' | 'transfer' | 'card',
  });

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (searchParams.get('walkIn') === '1') {
      setWalkInOpen(true);
      searchParams.delete('walkIn');
      setSearchParams(searchParams, { replace: true });
    }
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
    const hl = searchParams.get('highlight');
    if (hl) setHighlightId(hl);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!highlightId || !bookings.length) return;
    const booking = bookings.find((b) => b.id === highlightId);
    if (booking) {
      setSelectedBooking(booking);
      setDetailOpen(true);
      setHighlightId('');
      searchParams.delete('highlight');
      setSearchParams(searchParams, { replace: true });
    }
  }, [highlightId, bookings, searchParams, setSearchParams]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest_phone?.includes(searchQuery) ||
      generateBookingId(booking.id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirm = async (booking: any) => {
    await confirmBooking(booking.id);
    // Refresh the selected booking
    const updated = bookings.find(b => b.id === booking.id);
    if (updated) setSelectedBooking({ ...updated, status: 'confirmed' });
    fetchBookings();
  };

  const handleCheckIn = async (booking: any) => {
    await checkIn(booking.id);
    const updated = bookings.find(b => b.id === booking.id);
    if (updated) setSelectedBooking({ ...updated, status: 'checked-in' });
    fetchBookings();
  };

  const handleCheckOut = async (booking: any) => {
    await checkOut(booking.id);
    setSelectedBooking(null);
    setDetailOpen(false);
    fetchBookings();
  };

  const handleCancel = async (booking: any) => {
    await cancelBooking(booking.id);
    setSelectedBooking(null);
    setDetailOpen(false);
    fetchBookings();
  };

  // Walk-in booking handlers
  const handleWalkInSubmit = async () => {
    if (!walkInForm.room_id || !walkInForm.guest_name || !walkInForm.guest_phone) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setWalkInLoading(true);
    try {
      const selectedRoom = rooms.find(r => r.id === walkInForm.room_id);
      const nights = differenceInDays(walkInForm.check_out, walkInForm.check_in);
      const totalAmount = (selectedRoom?.price || 0) * nights;

      await createBooking({
        room_id: walkInForm.room_id,
        guest_name: walkInForm.guest_name,
        guest_phone: walkInForm.guest_phone,
        guest_email: walkInForm.guest_email ? walkInForm.guest_email : '',
        guest_id_card: null,
        check_in: format(walkInForm.check_in, 'yyyy-MM-dd'),
        check_out: format(walkInForm.check_out, 'yyyy-MM-dd'),
        adults: walkInForm.adults,
        children: walkInForm.children,
        notes: walkInForm.notes ? walkInForm.notes : '',
        total_amount: totalAmount,
        status: 'confirmed',
        payment_status: 'pending',
        payment_method: walkInForm.payment_method,
      });

      setWalkInOpen(false);
      setWalkInForm({
        room_id: '',
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        check_in: new Date(),
        check_out: new Date(Date.now() + 86400000),
        adults: 1,
        children: 0,
        notes: '',
        payment_method: 'cash',
      });
      fetchBookings();
      fetchRooms();
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างการจอง');
    } finally {
      setWalkInLoading(false);
    }
  };

  const availableRoomsForBooking = rooms.filter(r => r.status === 'available');
  const walkInNights = differenceInDays(walkInForm.check_out, walkInForm.check_in);
  const walkInTotal = (rooms.find(r => r.id === walkInForm.room_id)?.price || 0) * walkInNights;

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const checkedInBookings = bookings.filter(b => b.status === 'checked-in').length;
  const checkOutToday = bookings.filter(b => {
    const today = new Date().toDateString();
    return new Date(b.check_out).toDateString() === today && b.status === 'checked-in';
  }).length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="การจองทั้งหมด"
        subtitle="จัดการและดูรายละเอียดการจอง"
        actions={
          <Button variant="yada" onClick={() => setWalkInOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            รับจอง Walk-in
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-yada-primary text-white">
          <CardContent className="p-4">
            <p className="text-3xl font-bold">{totalBookings}</p>
            <p className="text-sm opacity-80">ทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-yellow-600">{pendingBookings}</p>
            <p className="text-sm text-gray-500">รอยืนยัน</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-green-600">{checkedInBookings}</p>
            <p className="text-sm text-gray-500">Check-in</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-blue-600">{checkOutToday}</p>
            <p className="text-sm text-gray-500">Check-out</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-red-600">{cancelledBookings}</p>
            <p className="text-sm text-gray-500">ยกเลิก</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ค้นหาชื่อลูกค้า, รหัสจอง, หมายเลขห้อง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="ทุกสถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="pending">รอยืนยัน</SelectItem>
            <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
            <SelectItem value="checked-in">Check-in</SelectItem>
            <SelectItem value="checked-out">Check-out</SelectItem>
            <SelectItem value="cancelled">ยกเลิก</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdminDataTable
        data={filteredBookings}
        keyExtractor={(booking) => booking.id}
        highlightId={highlightId || undefined}
        emptyMessage="ไม่พบข้อมูลการจอง"
        onRowClick={(booking) => {
          setSelectedBooking(booking);
          setDetailOpen(true);
        }}
        columns={[
          {
            key: 'id',
            header: 'รหัสจอง',
            render: (booking) => (
              <span className="font-medium text-yada-primary">{generateBookingId(booking.id)}</span>
            ),
          },
          {
            key: 'guest',
            header: 'ลูกค้า',
            render: (booking) => (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yada-primary/10">
                  <User className="h-4 w-4 text-yada-primary" />
                </div>
                <div>
                  <p className="font-medium">{booking.guest_name}</p>
                  <p className="text-sm text-gray-500">{booking.guest_phone}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'room',
            header: 'ห้องพัก',
            render: (booking) => (
              <span className="text-sm">{rooms.find((r) => r.id === booking.room_id)?.name_th || '-'}</span>
            ),
          },
          {
            key: 'nights',
            header: 'จำนวนคืน',
            render: (booking) => (
              <span className="text-sm">{calculateNights(booking.check_in, booking.check_out)} คืน</span>
            ),
          },
          {
            key: 'total',
            header: 'ยอดรวม',
            render: (booking) => (
              <span className="font-medium">฿{booking.total_amount?.toLocaleString() || 0}</span>
            ),
          },
          {
            key: 'status',
            header: 'สถานะ',
            render: (booking) => (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  bookingStatusConfig[booking.status as keyof typeof bookingStatusConfig]?.color ||
                  bookingStatusConfig.pending.color
                }`}
              >
                {bookingStatusConfig[booking.status as keyof typeof bookingStatusConfig]?.label || booking.status}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: () => (
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            ),
          },
        ]}
      />

      {/* Booking Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">รายละเอียดการจอง</DialogTitle>
                <p className="text-sm text-gray-500">{generateBookingId(selectedBooking.id)}</p>
              </DialogHeader>
              
              <div className="space-y-4 mt-2">
                {/* Guest Info */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-yada-primary/10 flex items-center justify-center ring-2 ring-yada-primary/10">
                    <User className="w-6 h-6 text-yada-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-yada-text">{selectedBooking.guest_name}</p>
                    <div className="flex items-center gap-1 text-yada-text-secondary text-sm">
                      <Phone className="w-3 h-3" />
                      <span>{selectedBooking.guest_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-yada-sand rounded-lg">
                    <p className="text-xs text-yada-text-secondary mb-1">ห้องพัก</p>
                    <p className="font-medium text-yada-text">
                      {rooms.find((r) => r.id === selectedBooking.room_id)?.name_th || '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-yada-sand rounded-lg">
                    <p className="text-xs text-yada-text-secondary mb-1">จำนวนคืน</p>
                    <p className="font-medium text-yada-text">
                      {calculateNights(selectedBooking.check_in, selectedBooking.check_out)} คืน
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-yada-sand rounded-lg">
                    <p className="text-xs text-yada-text-secondary mb-1">Check-in</p>
                    <p className="font-medium text-yada-text">
                      {new Date(selectedBooking.check_in).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="p-3 bg-yada-sand rounded-lg">
                    <p className="text-xs text-yada-text-secondary mb-1">Check-out</p>
                    <p className="font-medium text-yada-text">
                      {new Date(selectedBooking.check_out).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ยอดรวม</span>
                    <span className="font-semibold">฿{selectedBooking.total_amount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชำระแล้ว</span>
                    <span className="text-green-600">
                      ฿{selectedBooking.payment_status === 'paid' ? selectedBooking.total_amount?.toLocaleString() : 0}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-gray-600">สถานะ</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      bookingStatusConfig[selectedBooking.status as keyof typeof bookingStatusConfig]?.color ||
                      bookingStatusConfig.pending.color
                    }`}
                  >
                    {bookingStatusConfig[selectedBooking.status as keyof typeof bookingStatusConfig]?.label ||
                      selectedBooking.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-2">
                  {/* Pending: Show Confirm + Cancel */}
                  {selectedBooking.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleConfirm(selectedBooking)}
                        variant="yada"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        ยืนยันการจอง
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleCancel(selectedBooking)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        ยกเลิก
                      </Button>
                    </div>
                  )}
                  
                  {/* Confirmed: Show Check-in */}
                  {selectedBooking.status === 'confirmed' && (
                    <Button
                      onClick={() => handleCheckIn(selectedBooking)}
                      variant="yada" className="w-full"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Check-in
                    </Button>
                  )}
                  
                  {/* Checked-in: Show Check-out */}
                  {selectedBooking.status === 'checked-in' && (
                    <Button
                      onClick={() => handleCheckOut(selectedBooking)}
                      variant="yada" className="w-full"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Check-out
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Walk-in Booking Dialog */}
      <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รับจอง Walk-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Room Selection */}
            <div>
              <Label>เลือกห้องพัก *</Label>
              <Select
                value={walkInForm.room_id}
                onValueChange={(value) => setWalkInForm({ ...walkInForm, room_id: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="เลือกห้องพัก" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoomsForBooking.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name_th} - ฿{room.price?.toLocaleString()}/คืน
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableRoomsForBooking.length === 0 && (
                <p className="text-sm text-red-500 mt-1">ไม่มีห้องว่าง</p>
              )}
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>วันที่เข้าพัก *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-2 justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(walkInForm.check_in, 'd MMM yyyy', { locale: th })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={walkInForm.check_in}
                      onSelect={(date) => date && setWalkInForm({ ...walkInForm, check_in: date })}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>วันที่ออก *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-2 justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(walkInForm.check_out, 'd MMM yyyy', { locale: th })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={walkInForm.check_out}
                      onSelect={(date) => date && setWalkInForm({ ...walkInForm, check_out: date })}
                      disabled={(date) => date <= walkInForm.check_in}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Guest Info */}
            <div>
              <Label>ชื่อ-นามสกุล *</Label>
              <Input
                value={walkInForm.guest_name}
                onChange={(e) => setWalkInForm({ ...walkInForm, guest_name: e.target.value })}
                placeholder="ชื่อผู้เข้าพัก"
                className="mt-2"
              />
            </div>

            <div>
              <Label>เบอร์โทรศัพท์ *</Label>
              <Input
                value={walkInForm.guest_phone}
                onChange={(e) => setWalkInForm({ ...walkInForm, guest_phone: e.target.value })}
                placeholder="081-234-5678"
                className="mt-2"
              />
            </div>

            <div>
              <Label>อีเมล (ไม่บังคับ)</Label>
              <Input
                type="email"
                value={walkInForm.guest_email}
                onChange={(e) => setWalkInForm({ ...walkInForm, guest_email: e.target.value })}
                placeholder="email@example.com"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ผู้ใหญ่</Label>
                <Input
                  type="number"
                  min={1}
                  value={walkInForm.adults}
                  onChange={(e) => setWalkInForm({ ...walkInForm, adults: parseInt(e.target.value) || 1 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>เด็ก</Label>
                <Input
                  type="number"
                  min={0}
                  value={walkInForm.children}
                  onChange={(e) => setWalkInForm({ ...walkInForm, children: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>วิธีการชำระเงิน</Label>
              <Select
                value={walkInForm.payment_method}
                onValueChange={(value: 'cash' | 'transfer' | 'card') => setWalkInForm({ ...walkInForm, payment_method: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">เงินสด</SelectItem>
                  <SelectItem value="transfer">โอนเงิน</SelectItem>
                  <SelectItem value="card">บัตรเครดิต</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>หมายเหตุ</Label>
              <Input
                value={walkInForm.notes}
                onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value })}
                placeholder="หมายเหตุเพิ่มเติม..."
                className="mt-2"
              />
            </div>

            {/* Summary */}
            {walkInForm.room_id && walkInNights > 0 && (
              <div className="p-4 bg-yada-sand rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>จำนวนคืน</span>
                  <span>{walkInNights} คืน</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>ยอดรวม</span>
                  <span className="text-yada-accent">฿{walkInTotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setWalkInOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                variant="yada" className="flex-1"
                onClick={handleWalkInSubmit}
                disabled={walkInLoading || !walkInForm.room_id || !walkInForm.guest_name || !walkInForm.guest_phone}
              >
                {walkInLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  'ยืนยันการจอง'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>    </div>
  );
}

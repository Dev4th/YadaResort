import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Bed, Users, Phone, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBookingStore, useRoomStore } from '@/stores/supabaseStore';

interface BookingWithRoom {
  id: string;
  room_id: string;
  room_name: string;
  guest_name: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  nights: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-blue-400',
  'checked-in': 'bg-green-500',
  'checked-out': 'bg-gray-400',
  cancelled: 'bg-red-400',
};

const statusLabels: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  'checked-in': 'เข้าพัก',
  'checked-out': 'เช็คเอาท์',
  cancelled: 'ยกเลิก',
};

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'timeline'>('timeline');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRoom | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { bookings, fetchBookings } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  // Process bookings with room info
  const processedBookings = useMemo(() => {
    return bookings.map(booking => {
      const room = rooms.find(r => r.id === booking.room_id);
      const checkIn = parseISO(booking.check_in);
      const checkOut = parseISO(booking.check_out);
      return {
        ...booking,
        room_name: room?.name || room?.name_th || 'Unknown',
        nights: differenceInDays(checkOut, checkIn)
      };
    }).filter(booking => {
      if (statusFilter === 'all') return booking.status !== 'cancelled';
      return booking.status === statusFilter;
    });
  }, [bookings, rooms, statusFilter]);

  // Get days in current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get bookings for a specific day
  const getBookingsForDay = (day: Date) => {
    return processedBookings.filter(booking => {
      const checkIn = parseISO(booking.check_in);
      const checkOut = parseISO(booking.check_out);
      return isWithinInterval(day, { start: checkIn, end: checkOut }) ||
             isSameDay(day, checkIn) ||
             isSameDay(day, checkOut);
    });
  };

  // Navigate months
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Handle booking click
  const handleBookingClick = (booking: BookingWithRoom) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  // Timeline View Component
  const TimelineView = () => {
    // Get first and last day of visible range (current month)
    const days = daysInMonth;
    
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header - Days */}
          <div className="flex border-b sticky top-0 bg-white z-10">
            <div className="w-32 shrink-0 p-2 font-medium text-sm border-r bg-gray-50">
              ห้องพัก
            </div>
            <div className="flex-1 flex">
              {days.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={i}
                    className={`flex-1 min-w-[40px] p-1 text-center text-xs border-r ${
                      isToday ? 'bg-resort-primary text-white' : 
                      isWeekend ? 'bg-gray-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{format(day, 'd')}</div>
                    <div className={isToday ? 'text-white/80' : 'text-gray-500'}>
                      {format(day, 'EEE', { locale: th })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rooms with bookings */}
          {rooms.map(room => {
            const roomBookings = processedBookings.filter(b => b.room_id === room.id);
            
            return (
              <div key={room.id} className="flex border-b hover:bg-gray-50/50">
                <div className="w-32 shrink-0 p-2 border-r bg-white">
                  <div className="font-medium text-sm truncate">{room.name}</div>
                  <div className="text-xs text-gray-500">{room.capacity} คน</div>
                </div>
                <div className="flex-1 flex relative h-16">
                  {days.map((day, i) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <div
                        key={i}
                        className={`flex-1 min-w-[40px] border-r ${isWeekend ? 'bg-gray-50' : ''}`}
                      />
                    );
                  })}
                  
                  {/* Booking bars */}
                  {roomBookings.map(booking => {
                    const checkIn = parseISO(booking.check_in);
                    const checkOut = parseISO(booking.check_out);
                    
                    // Calculate position
                    const startDay = Math.max(0, differenceInDays(checkIn, monthStart));
                    const endDay = Math.min(days.length, differenceInDays(checkOut, monthStart));
                    
                    if (endDay < 0 || startDay >= days.length) return null;
                    
                    const left = `${(startDay / days.length) * 100}%`;
                    const width = `${((endDay - startDay) / days.length) * 100}%`;
                    
                    return (
                      <TooltipProvider key={booking.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={`absolute top-2 h-12 rounded-md px-2 text-white text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden ${statusColors[booking.status]}`}
                              style={{ left, width, minWidth: '60px' }}
                              onClick={() => handleBookingClick(booking)}
                            >
                              <div className="truncate">{booking.guest_name}</div>
                              <div className="text-white/80 truncate text-[10px]">
                                {booking.nights} คืน
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-medium">{booking.guest_name}</p>
                              <p>{format(checkIn, 'd MMM', { locale: th })} - {format(checkOut, 'd MMM', { locale: th })}</p>
                              <p>{statusLabels[booking.status]}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Month View Component
  const MonthView = () => {
    const weeks: Date[][] = [];
    let week: Date[] = [];
    
    // Add padding for first week
    const firstDayOfMonth = monthStart.getDay();
    for (let i = 0; i < firstDayOfMonth; i++) {
      week.push(new Date(0)); // placeholder
    }
    
    daysInMonth.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });
    
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(new Date(0)); // placeholder
      }
      weeks.push(week);
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, i) => (
          <div key={i} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {weeks.flat().map((day, i) => {
          const isValid = day.getTime() > 0;
          const isToday = isValid && isSameDay(day, new Date());
          const isCurrentMonth = isValid && isSameMonth(day, currentDate);
          const dayBookings = isValid ? getBookingsForDay(day) : [];
          
          return (
            <div
              key={i}
              className={`bg-white min-h-[100px] p-1 ${
                !isCurrentMonth ? 'opacity-30' : ''
              } ${isToday ? 'ring-2 ring-resort-primary ring-inset' : ''}`}
            >
              {isValid && (
                <>
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-resort-primary' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map(booking => (
                      <button
                        key={booking.id}
                        className={`w-full text-left text-xs p-1 rounded text-white truncate ${statusColors[booking.status]}`}
                        onClick={() => handleBookingClick(booking)}
                      >
                        {booking.room_name}: {booking.guest_name}
                      </button>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{dayBookings.length - 3} อื่นๆ
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-resort-text">ปฏิทินการจอง</h1>
          <p className="text-resort-text-secondary">ดูภาพรวมการจองทั้งหมด</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              className={viewMode === 'timeline' ? 'bg-resort-primary text-white' : ''}
              onClick={() => setViewMode('timeline')}
            >
              <Bed className="w-4 h-4 mr-1" />
              Timeline
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              className={viewMode === 'month' ? 'bg-resort-primary text-white' : ''}
              onClick={() => setViewMode('month')}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Month
            </Button>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รอยืนยัน</SelectItem>
              <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
              <SelectItem value="checked-in">เข้าพัก</SelectItem>
              <SelectItem value="checked-out">เช็คเอาท์</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                วันนี้
              </Button>
            </div>
            
            <CardTitle className="text-xl">
              {format(currentDate, 'MMMM yyyy', { locale: th })}
            </CardTitle>
            
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              {Object.entries(statusLabels).filter(([key]) => key !== 'cancelled').map(([status, label]) => (
                <div key={status} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${statusColors[status]}`} />
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'timeline' ? <TimelineView /> : <MonthView />}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processedBookings.filter(b => b.status === 'pending').length}</p>
                <p className="text-sm text-gray-500">รอยืนยัน</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processedBookings.filter(b => b.status === 'confirmed').length}</p>
                <p className="text-sm text-gray-500">ยืนยันแล้ว</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processedBookings.filter(b => b.status === 'checked-in').length}</p>
                <p className="text-sm text-gray-500">กำลังเข้าพัก</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bed className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rooms.filter(r => r.status === 'available').length}/{rooms.length}</p>
                <p className="text-sm text-gray-500">ห้องว่าง</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  {selectedBooking.room_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${statusColors[selectedBooking.status]} text-white`}>
                    {statusLabels[selectedBooking.status]}
                  </Badge>
                  <span className="text-lg font-bold text-resort-accent">
                    ฿{selectedBooking.total_amount?.toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedBooking.guest_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.guest_phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span>
                      {format(parseISO(selectedBooking.check_in), 'd MMM yyyy', { locale: th })} - {format(parseISO(selectedBooking.check_out), 'd MMM yyyy', { locale: th })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.nights} คืน</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDetailOpen(false)}
                  >
                    ปิด
                  </Button>
                  <Button
                    className="flex-1 bg-resort-primary hover:bg-resort-primary-hover"
                    onClick={() => {
                      window.location.href = `/admin/bookings?id=${selectedBooking.id}`;
                    }}
                  >
                    ดูรายละเอียด
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

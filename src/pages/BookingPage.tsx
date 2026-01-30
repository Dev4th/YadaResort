import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { ArrowRight, ArrowLeft, Check, Loader2, Home, Users, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingStore, useGuestStore, useRoomStore } from '@/stores/supabaseStore';
import { supabase } from '@/lib/supabase';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  
  const { createBooking } = useBookingStore();
  const { upsertGuest } = useGuestStore();
  const { rooms, fetchRooms } = useRoomStore();
  
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Step 1: Date & Guest Count
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [adults, setAdults] = useState<string>('2');
  const [children, setChildren] = useState<string>('0');
  
  // Step 2: Room Selection
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomId || '');
  
  // Step 3: Guest Info
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: '',
    email: '',
    idCard: '',
    notes: ''
  });
  
  useEffect(() => {
    fetchRooms();
  }, []);
  
  useEffect(() => {
    if (roomId) {
      setSelectedRoomId(roomId);
    }
  }, [roomId]);
  
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const totalAmount = selectedRoom ? selectedRoom.price * nights : 0;
  const availableRooms = rooms.filter(r => r.status === 'available');
  
  const handleNext = () => {
    if (step === 1 && checkIn && checkOut && nights > 0) {
      setStep(2);
    } else if (step === 2 && selectedRoomId) {
      setStep(3);
    }
  };
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    if (!selectedRoom || !checkIn || !checkOut || !guestInfo.name || !guestInfo.phone) return;
    
    setLoading(true);
    try {
      // Create or update guest
      await upsertGuest({
        name: guestInfo.name,
        phone: guestInfo.phone,
        email: guestInfo.email || null,
        id_card: guestInfo.idCard || null,
        nationality: 'Thai',
        total_visits: 0,
        notes: guestInfo.notes || null
      });
      
      // Create booking
      const booking = await createBooking({
        room_id: selectedRoom.id,
        guest_name: guestInfo.name,
        guest_phone: guestInfo.phone,
        guest_email: guestInfo.email || '',
        guest_id_card: guestInfo.idCard || '',
        check_in: checkIn,
        check_out: checkOut,
        adults: parseInt(adults),
        children: parseInt(children),
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_method: '',
        notes: guestInfo.notes || ''
      });
      
      // Create payment record
      await supabase.from('payments').insert({
        booking_id: booking.id,
        amount: totalAmount,
        method: 'transfer',
        status: 'pending',
        notes: 'รอการชำระเงิน'
      });
      
      setSuccess(true);
    } catch (error) {
      console.error('Booking error:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-gray-100 shadow-sm">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-resort-text mb-3">จองสำเร็จ!</h2>
            <p className="text-gray-600 mb-8">
              กรุณารอการยืนยันจากทางรีสอร์ท<br />
              เราจะติดต่อกลับภายใน 24 ชั่วโมง
            </p>
            <Link to="/">
              <Button className="w-full bg-resort-primary hover:bg-resort-primary-hover h-14 transition-all duration-300">
                <Home className="w-5 h-5 mr-2" />
                กลับหน้าหลัก
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-resort-cream">
      {/* Navbar - Same style as Landing Page */}
      <nav className="bg-resort-white shadow-sm border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-semibold text-resort-text">
                Yada Homestay
              </span>
              <span className="text-sm text-resort-accent">
                | ญาดาโฮมสเตย์
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-resort-text hover:text-resort-primary transition-colors">
                หน้าแรก
              </Link>
              <Link to="/#rooms" className="text-sm font-medium text-resort-text hover:text-resort-primary transition-colors">
                ห้องพัก
              </Link>
              <Link to="/#amenities" className="text-sm font-medium text-resort-text hover:text-resort-primary transition-colors">
                สิ่งอำนวยความสะดวก
              </Link>
              <Link to="/#gallery" className="text-sm font-medium text-resort-text hover:text-resort-primary transition-colors">
                แกลเลอรี่
              </Link>
              <Link to="/#contact" className="text-sm font-medium text-resort-text hover:text-resort-primary transition-colors">
                ติดต่อเรา
              </Link>
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a href="tel:081-234-5678" className="flex items-center gap-2 text-sm font-medium text-resort-text">
                <Phone className="w-4 h-4" />
                <span>081-234-5678</span>
              </a>
              <Button className="bg-resort-primary hover:bg-resort-primary-hover text-white px-6 transition-all duration-300">
                จองเลย
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-10">
          <span className="text-resort-accent text-sm font-medium tracking-wide">จองห้องพัก</span>
          <h2 className="text-3xl font-semibold text-resort-text mt-2">
            เริ่มต้นการจองของคุณ
          </h2>
        </div>
        
        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-0">
            {[
              { num: 1, label: 'เลือกวันที่' },
              { num: 2, label: 'เลือกห้อง' },
              { num: 3, label: 'ยืนยัน' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold transition-all border-2 ${
                      step === s.num
                        ? 'bg-resort-primary text-white border-resort-primary'
                        : step > s.num
                        ? 'bg-resort-primary text-white border-resort-primary'
                        : 'bg-white text-gray-400 border-gray-200'
                    }`}
                  >
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-sm mt-3 font-medium ${step >= s.num ? 'text-resort-text' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-24 h-0.5 mx-2 -mt-6 ${step > s.num ? 'bg-resort-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Form Card */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-8">
            {/* Step 1: Dates */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่เข้าพัก *</Label>
                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-2 h-12 border-gray-200 focus:border-resort-primary focus:ring-resort-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่ออก *</Label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="mt-2 h-12 border-gray-200 focus:border-resort-primary focus:ring-resort-primary"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">จำนวนผู้ใหญ่ *</Label>
                    <Select value={adults} onValueChange={setAdults}>
                      <SelectTrigger className="mt-2 h-12 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} ท่าน</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">จำนวนเด็ก</Label>
                    <Select value={children} onValueChange={setChildren}>
                      <SelectTrigger className="mt-2 h-12 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} ท่าน</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  onClick={handleNext}
                  disabled={!checkIn || !checkOut || nights <= 0}
                  className="w-full bg-resort-primary hover:bg-resort-primary-hover h-14 text-base font-medium rounded-lg disabled:opacity-40 transition-all duration-300"
                >
                  ถัดไป
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
            
            {/* Step 2: Room Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="p-4 bg-resort-cream rounded-xl mb-4 border border-gray-100">
                  <div className="flex items-center gap-6 text-sm text-resort-text">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-resort-primary" />
                      <span>{format(new Date(checkIn), 'd MMM yyyy', { locale: th })} - {format(new Date(checkOut), 'd MMM yyyy', { locale: th })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-resort-primary" />
                      <span>{adults} ผู้ใหญ่ {parseInt(children) > 0 && `, ${children} เด็ก`}</span>
                    </div>
                  </div>
                </div>
                
                <Label className="text-sm font-medium text-gray-700">เลือกห้องพัก *</Label>
                <div className="grid gap-4 mt-2">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedRoomId === room.id
                          ? 'border-resort-primary bg-resort-primary/5 shadow-sm'
                          : 'border-gray-200 hover:border-resort-primary/50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={room.images?.[0] || '/images/room-standard.jpg'}
                          alt={room.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-resort-text">{room.name}</h4>
                          <p className="text-sm text-resort-text-secondary mt-1">{room.capacity} ท่าน</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-resort-accent">฿{room.price?.toLocaleString()}</p>
                          <p className="text-sm text-resort-text-secondary">/คืน</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedRoom && nights > 0 && (
                  <div className="p-5 bg-resort-cream rounded-xl border border-gray-200">
                    <div className="flex justify-between mb-2 text-resort-text-secondary">
                      <span>ราคา {nights} คืน</span>
                      <span>฿{(selectedRoom.price * nights).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-resort-text">
                      <span>ยอดรวม</span>
                      <span>฿{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-14 border-gray-200 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    ย้อนกลับ
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedRoomId}
                    className="flex-1 bg-resort-primary hover:bg-resort-primary-hover h-14 disabled:opacity-40 transition-all duration-300"
                  >
                    ถัดไป
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="p-5 bg-resort-cream rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-resort-text mb-4">สรุปการจอง</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-resort-text-secondary">ห้องพัก</span>
                      <span className="font-medium text-resort-text">{selectedRoom?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-resort-text-secondary">วันที่</span>
                      <span className="font-medium text-resort-text">
                        {format(new Date(checkIn), 'd MMM', { locale: th })} - {format(new Date(checkOut), 'd MMM yyyy', { locale: th })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-resort-text-secondary">จำนวนคืน</span>
                      <span className="font-medium text-resort-text">{nights} คืน</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-resort-text-secondary">ผู้เข้าพัก</span>
                      <span className="font-medium text-resort-text">{adults} ผู้ใหญ่ {parseInt(children) > 0 && `, ${children} เด็ก`}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-resort-text">ยอดรวม</span>
                        <span className="text-resort-accent">฿{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Guest Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-resort-text">ข้อมูลผู้จอง</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล *</Label>
                      <Input
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                        placeholder="ชื่อผู้จอง"
                        className="mt-2 h-12 border-gray-200"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์ *</Label>
                      <Input
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        placeholder="081-234-5678"
                        className="mt-2 h-12 border-gray-200"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">อีเมล</Label>
                      <Input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        placeholder="email@example.com"
                        className="mt-2 h-12 border-gray-200"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">หมายเหตุ</Label>
                      <Input
                        value={guestInfo.notes}
                        onChange={(e) => setGuestInfo({ ...guestInfo, notes: e.target.value })}
                        placeholder="ข้อมูลเพิ่มเติม..."
                        className="mt-2 h-12 border-gray-200"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-14 border-gray-200 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    ย้อนกลับ
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !guestInfo.name || !guestInfo.phone}
                    className="flex-1 bg-resort-primary hover:bg-resort-primary-hover h-14 disabled:opacity-40 transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        กำลังจอง...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        ยืนยันการจอง
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

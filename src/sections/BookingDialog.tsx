import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
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
import { useBookingStore, useGuestStore, useRoomStore } from '@/stores/supabaseStore';
import { supabase } from '@/lib/supabase';
import type { Room } from '@/stores/supabaseStore';

interface BookingDialogProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookingDialog({ room, open, onOpenChange }: BookingDialogProps) {
  const navigate = useNavigate();
  const { createBooking } = useBookingStore();
  const { upsertGuest } = useGuestStore();
  const { rooms, fetchRooms } = useRoomStore();
  
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Date & Guest Count
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [adults, setAdults] = useState<string>('2');
  const [children, setChildren] = useState<string>('0');
  
  // Step 2: Room Selection
  const [selectedRoomId, setSelectedRoomId] = useState<string>(room?.id || '');
  
  // Step 3: Guest Info
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: '',
    email: '',
    idCard: '',
    notes: ''
  });
  
  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || room;
  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const totalAmount = selectedRoom ? selectedRoom.price * nights : 0;
  
  useEffect(() => {
    if (open) {
      fetchRooms();
      setStep(1);
      setCheckIn('');
      setCheckOut('');
      setAdults('2');
      setChildren('0');
      setSelectedRoomId(room?.id || '');
      setGuestInfo({
        name: '',
        phone: '',
        email: '',
        idCard: '',
        notes: ''
      });
    }
  }, [open, room]);
  
  // Navigate to booking page
  useEffect(() => {
    if (open && room) {
      navigate(`/booking?room=${room.id}`);
      onOpenChange(false);
    }
  }, [open, room]);
  
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
    if (!selectedRoom || !checkIn || !checkOut) return;
    
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
      
      alert('จองสำเร็จ! กรุณารอการยืนยันจากทางรีสอร์ท');
      onOpenChange(false);
    } catch (error) {
      console.error('Booking error:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  const availableRooms = rooms.filter(r => r.status === 'available');
  
  if (!open) return null;
  
  return null; // Navigation handled by useEffect
}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, 'd MMM yyyy', { locale: th }) : 'เลือกวัน'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>วันออก</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, 'd MMM yyyy', { locale: th }) : 'เลือกวัน'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date <= (checkIn || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {nights > 0 && (
              <div className="p-4 bg-resort-accent/10 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>จำนวนคืน</span>
                  <span>{nights} คืน</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>ยอดรวม</span>
                  <span className="text-resort-accent">฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Step 2: Guest Info */}
        {step === 'guest' && (
          <div className="space-y-4">
            <div>
              <Label>ชื่อ-นามสกุล *</Label>
              <Input
                value={guestInfo.name}
                onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                placeholder="ชื่อผู้เข้าพัก"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>เบอร์โทรศัพท์ *</Label>
              <Input
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                placeholder="081-234-5678"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>อีเมล (ไม่บังคับ)</Label>
              <Input
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>เลขบัตรประชาชน (ไม่บังคับ)</Label>
              <Input
                value={guestInfo.idCard}
                onChange={(e) => setGuestInfo({ ...guestInfo, idCard: e.target.value })}
                placeholder="1-2345-67890-12-3"
                className="mt-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ผู้ใหญ่</Label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setGuestInfo({ ...guestInfo, adults: Math.max(1, guestInfo.adults - 1) })}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{guestInfo.adults}</span>
                  <button
                    onClick={() => setGuestInfo({ ...guestInfo, adults: guestInfo.adults + 1 })}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <Label>เด็ก</Label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setGuestInfo({ ...guestInfo, children: Math.max(0, guestInfo.children - 1) })}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{guestInfo.children}</span>
                  <button
                    onClick={() => setGuestInfo({ ...guestInfo, children: guestInfo.children + 1 })}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <Label>หมายเหตุ (ไม่บังคับ)</Label>
              <Input
                value={guestInfo.notes}
                onChange={(e) => setGuestInfo({ ...guestInfo, notes: e.target.value })}
                placeholder="ข้อมูลเพิ่มเติม..."
                className="mt-2"
              />
            </div>
          </div>
        )}
        
        {/* Step 3: Payment */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">ห้องพัก</span>
                <span>{room?.name_th}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">จำนวนคืน</span>
                <span>{nights} คืน</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">ผู้เข้าพัก</span>
                <span>{guestInfo.name}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>ยอดรวม</span>
                  <span className="text-resort-accent">฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label>วิธีการชำระเงิน</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { id: 'transfer', name: 'โอนเงิน', icon: '💳' },
                  { id: 'cash', name: 'เงินสด', icon: '💵' },
                  { id: 'card', name: 'บัตรเครดิต', icon: '💳' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      paymentMethod === method.id
                        ? 'border-resort-accent bg-resort-accent/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <p className="text-sm mt-1">{method.name}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {paymentMethod === 'transfer' && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">ข้อมูลบัญชีธนาคาร</p>
                <p className="text-sm text-blue-600 mt-1">
                  ธนาคารกสิกรไทย<br />
                  ชื่อบัญชี: Yada Homestay<br />
                  เลขบัญชี: 123-4-56789-0
                </p>
                <p className="text-xs text-blue-500 mt-2">
                  * กรุณาแจ้งสลิปการโอนเงินผ่าน LINE หรือโทร 081-234-5678
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Success */}
        {step === 'success' && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">จองห้องพักสำเร็จ!</h3>
            <p className="text-gray-600 mb-4">
              หมายเลขการจอง: <span className="font-mono font-bold">{bookingId}</span>
            </p>
            <div className="p-4 bg-gray-50 rounded-lg text-left mb-4">
              <p><strong>ห้อง:</strong> {room?.name_th}</p>
              <p><strong>วันที่:</strong> {checkIn && format(checkIn, 'd MMM yyyy', { locale: th })} - {checkOut && format(checkOut, 'd MMM yyyy', { locale: th })}</p>
              <p><strong>ยอดรวม:</strong> ฿{totalAmount.toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-500">
              กรุณาชำระเงินภายใน 24 ชั่วโมง<br />
              สอบถามเพิ่มเติม: 081-234-5678
            </p>
          </div>
        )}
        
        {/* Footer Buttons */}
        {step !== 'success' && (
          <div className="flex gap-3 pt-4">
            {step !== 'dates' && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(step === 'guest' ? 'dates' : 'guest')}
              >
                ย้อนกลับ
              </Button>
            )}
            {step === 'payment' ? (
              <Button
                className="flex-1 bg-resort-primary hover:bg-resort-primary-hover"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังดำเนินการ...
                  </>
                ) : (
                  'ยืนยันการจอง'
                )}
              </Button>
            ) : (
              <Button
                className="flex-1 bg-resort-primary hover:bg-resort-primary-hover"
                onClick={handleContinue}
                disabled={!canContinue()}
              >
                ดำเนินการต่อ
              </Button>
            )}
          </div>
        )}
        
        {step === 'success' && (
          <Button
            className="w-full bg-resort-primary hover:bg-resort-primary-hover"
            onClick={() => onOpenChange(false)}
          >
            ปิด
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

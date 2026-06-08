import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check, Loader2, Home, Users, Calendar as CalendarIcon, AlertCircle, CreditCard, Banknote, QrCode, Copy, CalendarPlus, Phone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import ApiErrorState from '@/components/ApiErrorState';
import { downloadBookingIcs } from '@/lib/ics';
import BookingStepper from '@/components/booking/BookingStepper';
import BookingSummary from '@/components/booking/BookingSummary';
import { generatePromptPayQR } from '@/lib/promptpay';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useBookingStore, useGuestStore, useRoomStore, useSettingsStore } from '@/stores/store';
import { checkRoomAvailability, getAvailableRooms } from '@/lib/supabase';
import api from '@/lib/api';
import { saveBookingDraft, getGuestDraft, saveGuestDraft } from '@/lib/bookingDraft';
import { Seo, lodgingStructuredData } from '@/lib/seo';
import type { Room } from '@/stores/store';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialAdults = searchParams.get('adults') || '2';
  
  const { createBooking } = useBookingStore();
  const { upsertGuest } = useGuestStore();
  const { rooms, fetchRooms, error: roomsStoreError } = useRoomStore();
  const { settings } = useSettingsStore();
  
  const [step, setStep] = useState<number>(() => {
    const validDates =
      initialCheckIn &&
      initialCheckOut &&
      differenceInDays(new Date(initialCheckOut), new Date(initialCheckIn)) > 0;
    if (validDates && roomId) return 3;
    if (validDates) return 2;
    return 1;
  });
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [apiLoadError, setApiLoadError] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [availabilityError, setAvailabilityError] = useState<string>('');
  const [filteredRooms, setFilteredRooms] = useState<typeof rooms>([]);
  
  // Step 1: Date & Guest Count
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [adults, setAdults] = useState<string>(initialAdults);
  const [children, setChildren] = useState<string>('0');
  
  // Step 2: Room Selection
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomId || '');
  
  // Step 3: Guest Info
  const [guestInfo, setGuestInfo] = useState(() => {
    const draft = getGuestDraft();
    return {
      name: draft.name || '',
      phone: draft.phone || '',
      email: draft.email || '',
      idCard: '',
      notes: '',
    };
  });
  
  useEffect(() => {
    saveBookingDraft({ checkIn, checkOut, adults });
  }, [checkIn, checkOut, adults]);

  useEffect(() => {
    saveGuestDraft({
      name: guestInfo.name,
      phone: guestInfo.phone,
      email: guestInfo.email,
    });
  }, [guestInfo.name, guestInfo.phone, guestInfo.email]);

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<string>('transfer');
  const [successSlipFile, setSuccessSlipFile] = useState<File | null>(null);
  const [successSlipPreview, setSuccessSlipPreview] = useState('');
  const [successSlipUploading, setSuccessSlipUploading] = useState(false);
  const [successSlipUploaded, setSuccessSlipUploaded] = useState(false);
  const [successQrCode, setSuccessQrCode] = useState('');

  const bookingStructuredData = [
    lodgingStructuredData,
    {
      '@context': 'https://schema.org',
      '@type': 'ReserveAction',
      name: 'จองห้องพัก Yada Homestay',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://yadahomestay.com/booking',
        actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'],
      },
    },
  ];
  
  useEffect(() => {
    fetchRooms();
    useSettingsStore.getState().loadSettings();
  }, [fetchRooms]);

  useEffect(() => {
    if (roomsStoreError) setApiLoadError(true);
  }, [roomsStoreError]);
  
  useEffect(() => {
    if (roomId) {
      setSelectedRoomId(roomId);
    }
  }, [roomId]);

  // Fetch available rooms when dates change
  useEffect(() => {
    const fetchAvailable = async () => {
      if (checkIn && checkOut) {
        setRoomsLoading(true);
        try {
          const available = (await getAvailableRooms(checkIn, checkOut)) as Room[];
          setFilteredRooms(available);
          
          // If selected room is no longer available, clear selection
          if (selectedRoomId && !available.find((r) => r.id === selectedRoomId)) {
            setSelectedRoomId('');
            setAvailabilityError('ห้องที่เลือกไม่ว่างในช่วงวันที่ระบุ กรุณาเลือกห้องใหม่');
          } else {
            setAvailabilityError('');
          }
        } catch (error) {
          console.error('Error fetching available rooms:', error);
          setApiLoadError(true);
        } finally {
          setRoomsLoading(false);
        }
      } else {
        setFilteredRooms(rooms.filter(r => r.status === 'available'));
        setRoomsLoading(false);
      }
    };
    
    fetchAvailable();
  }, [checkIn, checkOut, rooms, selectedRoomId]);
  
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const totalAmount = selectedRoom ? selectedRoom.price * nights : 0;
  const availableRooms = filteredRooms.length > 0 ? filteredRooms : rooms.filter(r => r.status === 'available');

  useEffect(() => {
    if (step === 4 && paymentMethod === 'transfer' && settings.promptPayNumber && totalAmount > 0) {
      generatePromptPayQR(settings.promptPayNumber, totalAmount).then(setQrCode).catch(() => setQrCode(''));
    } else {
      setQrCode('');
    }
  }, [step, paymentMethod, settings.promptPayNumber, totalAmount]);

  useEffect(() => {
    if (success && paymentMethod === 'transfer' && settings.promptPayNumber && totalAmount > 0) {
      generatePromptPayQR(settings.promptPayNumber, totalAmount)
        .then(setSuccessQrCode)
        .catch(() => setSuccessQrCode(''));
    } else {
      setSuccessQrCode('');
    }
  }, [success, paymentMethod, settings.promptPayNumber, totalAmount]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`คัดลอก${label}แล้ว`));
  };
  
  const handleNext = async () => {
    if (step === 1 && checkIn && checkOut && nights > 0) {
      setStep(2);
    } else if (step === 2 && selectedRoomId) {
      // Double check availability before proceeding
      setLoading(true);
      try {
        const { available } = await checkRoomAvailability(selectedRoomId, checkIn, checkOut);
        if (!available) {
          setAvailabilityError(`ห้องนี้ไม่ว่างในช่วงวันที่เลือก มีการจองอยู่แล้ว`);
          setLoading(false);
          return;
        }
        setAvailabilityError('');
        setStep(3);
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailabilityError('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่');
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      // Validate required guest info with phone format check
      if (!guestInfo.name.trim()) {
        toast.error('กรุณากรอกชื่อ-นามสกุล');
        return;
      }
      const cleanPhone = guestInfo.phone.replace(/-/g, '').trim();
      if (!cleanPhone || !/^0[0-9]{8,9}$/.test(cleanPhone)) {
        toast.error('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
        return;
      }
      setStep(4);
    }
  };
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    if (!selectedRoom || !checkIn || !checkOut || !guestInfo.name || !guestInfo.phone) return;
    if (!acceptPrivacy) {
      toast.error('กรุณายอมรับนโยบายความเป็นส่วนตัว');
      return;
    }

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
        payment_method: paymentMethod,
        notes: guestInfo.notes || ''
      });
      
      // Create payment record
      await api.post('/payments', {
        booking_id: booking.id,
        amount: totalAmount,
        method: paymentMethod,
        status: 'pending',
        notes: 'รอการชำระเงิน'
      });
      
      setBookingId(booking.id);
      setSuccess(true);
      toast.success('จองสำเร็จ!');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessSlipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 3MB)');
      return;
    }
    setSuccessSlipFile(file);
    const reader = new FileReader();
    reader.onload = () => setSuccessSlipPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSuccessSlipUpload = async () => {
    if (!bookingId || !successSlipPreview) return;
    setSuccessSlipUploading(true);
    try {
      await api.post('/payment-slips', {
        booking_id: bookingId,
        image_url: successSlipPreview,
        amount: totalAmount,
        status: 'pending',
        notes: 'อัปโหลดหลังจองจากหน้า success',
      });
      setSuccessSlipUploaded(true);
      setSuccessSlipFile(null);
      toast.success('อัปโหลดสลิปสำเร็จ');
    } catch (error) {
      console.error('Slip upload error:', error);
      toast.error('อัปโหลดสลิปไม่สำเร็จ');
    } finally {
      setSuccessSlipUploading(false);
    }
  };
  
  const bookingRef = bookingId.slice(0, 8).toUpperCase();
  const firstBank = settings.bankAccounts?.[0];

  if (success) {
    return (
      <>
        <Seo
          title="จองสำเร็จ | Yada Homestay"
          description="การจองของคุณได้รับการบันทึกแล้ว ชำระเงินและตรวจสอบสถานะได้ทันที"
          path="/booking"
          noIndex
        />
        <div className="flex min-h-screen items-center justify-center bg-yada-sand px-4 pb-16 pt-28">
          <Card className="w-full max-w-lg border-yada-accent/20 shadow-yada">
            <CardContent className="p-8 sm:p-10">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yada-primary/15">
                  <Check className="h-10 w-10 text-yada-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-yada-text">จองสำเร็จ!</h2>
                <p className="mt-3 text-yada-text-secondary">
                  เราบันทึกคำขอจองแล้ว ทีมที่พักจะติดต่อกลับภายใน 24 ชั่วโมง
                </p>
              </div>

              {bookingId && (
                <div className="mt-6 rounded-xl bg-yada-sand p-4 text-center ring-1 ring-yada-accent/15">
                  <p className="text-sm text-yada-text-secondary">รหัสการจอง</p>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <p className="font-mono text-xl font-bold text-yada-primary">{bookingRef}</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bookingRef, 'รหัสการจอง')}
                      className="rounded-md p-1 text-yada-text-secondary hover:bg-white hover:text-yada-primary"
                      aria-label="คัดลอกรหัสการจอง"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-yada-text-secondary">
                    ยอดชำระ ฿{totalAmount.toLocaleString()} · {selectedRoom?.name_th || selectedRoom?.name}
                  </p>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="mt-6 space-y-4 rounded-xl border border-yada-accent/20 bg-white p-4">
                  <h3 className="font-semibold text-yada-text">ชำระเงินตอนนี้</h3>
                  {firstBank && (
                    <div className="space-y-1 text-sm text-yada-text-secondary">
                      <p>
                        {firstBank.bankName}:{' '}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(firstBank.accountNumber, 'เลขบัญชี')}
                          className="font-mono font-semibold text-yada-text hover:text-yada-primary"
                        >
                          {firstBank.accountNumber}
                        </button>
                      </p>
                      <p>ชื่อบัญชี: {firstBank.accountName}</p>
                    </div>
                  )}
                  {successQrCode && (
                    <div className="text-center">
                      <p className="mb-2 text-sm font-medium text-yada-text">สแกน PromptPay</p>
                      <img src={successQrCode} alt="PromptPay QR" className="mx-auto h-44 w-44 rounded-lg border border-yada-border" />
                    </div>
                  )}

                  <div className="border-t border-yada-border pt-4">
                    <h4 className="mb-2 font-medium text-yada-text">แนบสลิป (ถ้าโอนแล้ว)</h4>
                    {successSlipUploaded ? (
                      <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                        อัปโหลดสลิปแล้ว รอทีมที่พักตรวจสอบ
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {successSlipPreview && (
                          <img src={successSlipPreview} alt="Slip preview" className="max-h-40 w-full rounded-lg border object-contain" />
                        )}
                        <label className="block cursor-pointer rounded-lg border border-dashed border-yada-primary/40 bg-yada-sand px-4 py-3 text-center text-sm font-medium text-yada-primary hover:bg-yada-primary/5">
                          เลือกรูปสลิป
                          <input type="file" accept="image/*" className="hidden" onChange={handleSuccessSlipChange} />
                        </label>
                        <Button
                          variant="yada"
                          className="w-full"
                          disabled={!successSlipFile || successSlipUploading}
                          onClick={handleSuccessSlipUpload}
                        >
                          {successSlipUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              กำลังอัปโหลด...
                            </>
                          ) : (
                            'อัปโหลดสลิป'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <p className="mt-6 rounded-xl border border-yada-accent/20 bg-white p-4 text-sm text-yada-text-secondary">
                  ชำระเงินสดเมื่อ check-in เวลา {settings.checkInTime || '14:00'} น.
                </p>
              )}

              <div className="mt-6 space-y-3">
                <Button
                  variant="yada-outline"
                  className="h-12 w-full"
                  onClick={() =>
                    downloadBookingIcs({
                      title: `เข้าพัก Yada Homestay — ${selectedRoom?.name_th || selectedRoom?.name || 'ห้องพัก'}`,
                      checkIn,
                      checkOut,
                      location: settings.address || 'Yada Homestay เพชรบุรี',
                      description: `รหัสจอง ${bookingRef}`,
                    })
                  }
                >
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  เพิ่มลงปฏิทิน (.ics)
                </Button>
                <Button variant="yada-outline" asChild className="h-12 w-full">
                  <Link to={`/check-booking?phone=${encodeURIComponent(guestInfo.phone)}`}>
                    ตรวจสอบสถานะการจอง
                  </Link>
                </Button>
                <Button variant="yada" asChild className="h-12 w-full">
                  <Link to="/">
                    <Home className="mr-2 h-5 w-5" />
                    กลับหน้าหลัก
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Seo
        title="จองห้องพัก Yada Homestay เพชรบุรี"
        description="เลือกวันเข้าพัก ตรวจห้องว่าง และส่งคำขอจอง Yada Homestay ที่พักเพชรบุรี บรรยากาศสงบ พร้อมห้องพักหลายประเภท"
        path="/booking"
        image="/images/room-deluxe.jpg"
        structuredData={bookingStructuredData}
      />
    <div className="min-h-screen bg-yada-sand pt-24">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="section-label">จองห้องพัก</span>
          <h2 className="font-display mt-2 text-3xl font-semibold text-yada-text">เริ่มต้นการจองของคุณ</h2>
        </div>

        <BookingStepper currentStep={step} />

        {apiLoadError && (
          <div className="mb-6">
            <ApiErrorState
              onRetry={() => {
                setApiLoadError(false);
                fetchRooms().catch(() => setApiLoadError(true));
              }}
              phone={settings.phone}
              lineUrl={settings.lineUrl}
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
        {availabilityError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{availabilityError}</p>
          </div>
        )}
        
        {/* Form Card */}
        <Card className="border-yada-accent/15 shadow-yada">
          <CardContent className="p-8">
            {/* Step 1: Dates */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่เข้าพัก *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="yada-outline" className="mt-2 h-12 w-full justify-start font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(new Date(checkIn), 'd MMM yyyy', { locale: th }) : 'เลือกวันเข้าพัก'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkIn ? new Date(checkIn) : undefined}
                          onSelect={(date) => date && setCheckIn(format(date, 'yyyy-MM-dd'))}
                          disabled={(date) => date < new Date(new Date().toDateString())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่ออก *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="yada-outline" className="mt-2 h-12 w-full justify-start font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(new Date(checkOut), 'd MMM yyyy', { locale: th }) : 'เลือกวันออก'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOut ? new Date(checkOut) : undefined}
                          onSelect={(date) => date && setCheckOut(format(date, 'yyyy-MM-dd'))}
                          disabled={(date) =>
                            date <= (checkIn ? new Date(checkIn) : new Date(new Date().toDateString()))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">จำนวนผู้ใหญ่ *</Label>
                    <Select value={adults} onValueChange={setAdults}>
                      <SelectTrigger className="mt-2 h-12 border-yada-border bg-yada-surface">
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
                      <SelectTrigger className="mt-2 h-12 border-yada-border bg-yada-surface">
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
                  variant="yada"
                  onClick={handleNext}
                  disabled={!checkIn || !checkOut || nights <= 0}
                  className="h-14 w-full text-base disabled:opacity-40"
                >
                  ถัดไป
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
            
            {/* Step 2: Room Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="p-4 bg-yada-sand rounded-xl mb-4 border border-gray-100">
                  <div className="flex items-center gap-6 text-sm text-yada-text">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-yada-primary" />
                      <span>{format(new Date(checkIn), 'd MMM yyyy', { locale: th })} - {format(new Date(checkOut), 'd MMM yyyy', { locale: th })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-yada-primary" />
                      <span>{adults} ผู้ใหญ่ {parseInt(children) > 0 && `, ${children} เด็ก`}</span>
                    </div>
                  </div>
                </div>
                
                <Label className="text-sm font-medium text-gray-700">เลือกห้องพัก *</Label>
                <div className="mt-2 grid gap-4">
                  {roomsLoading &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-4 rounded-xl border border-gray-200 p-5">
                        <Skeleton className="h-20 w-20 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  {!roomsLoading && availableRooms.length === 0 && (
                    <div className="rounded-xl border border-dashed border-yada-border bg-yada-sand/50 p-8 text-center text-yada-text-secondary">
                      ไม่มีห้องว่างในช่วงวันที่เลือก ลองเปลี่ยนวันที่หรือติดต่อที่พัก
                    </div>
                  )}
                  {!roomsLoading && availableRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedRoomId === room.id
                          ? 'border-yada-primary bg-yada-primary/5 shadow-sm'
                          : 'border-gray-200 hover:border-yada-primary/50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={room.images?.[0] || '/images/room-standard.jpg'}
                          alt={room.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-yada-text">{room.name}</h4>
                          <p className="text-sm text-yada-text-secondary mt-1">{room.capacity} ท่าน</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-yada-accent">฿{room.price?.toLocaleString()}</p>
                          <p className="text-sm text-yada-text-secondary">/คืน</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedRoom && nights > 0 && (
                  <div className="p-5 bg-yada-sand rounded-xl border border-gray-200">
                    <div className="flex justify-between mb-2 text-yada-text-secondary">
                      <span>ราคา {nights} คืน</span>
                      <span>฿{(selectedRoom.price * nights).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-yada-text">
                      <span>ยอดรวม</span>
                      <span>฿{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <Button variant="yada-outline" onClick={handleBack} className="h-14 flex-1">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    ย้อนกลับ
                  </Button>
                  <Button variant="yada" onClick={handleNext} disabled={!selectedRoomId || loading} className="h-14 flex-1 disabled:opacity-40">
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    ถัดไป
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="p-5 bg-yada-sand rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-yada-text mb-4">สรุปการจอง</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-yada-text-secondary">ห้องพัก</span>
                      <span className="font-medium text-yada-text">{selectedRoom?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yada-text-secondary">วันที่</span>
                      <span className="font-medium text-yada-text">
                        {format(new Date(checkIn), 'd MMM', { locale: th })} - {format(new Date(checkOut), 'd MMM yyyy', { locale: th })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yada-text-secondary">จำนวนคืน</span>
                      <span className="font-medium text-yada-text">{nights} คืน</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yada-text-secondary">ผู้เข้าพัก</span>
                      <span className="font-medium text-yada-text">{adults} ผู้ใหญ่ {parseInt(children) > 0 && `, ${children} เด็ก`}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-yada-text">ยอดรวม</span>
                        <span className="text-yada-accent">฿{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Guest Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-yada-text">ข้อมูลผู้จอง</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล *</Label>
                      <Input
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                        placeholder="ชื่อผู้จอง"
                        className="mt-2 h-12 border-yada-border bg-yada-surface"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์ *</Label>
                      <Input
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        placeholder="081-234-5678"
                        className="mt-2 h-12 border-yada-border bg-yada-surface"
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
                        className="mt-2 h-12 border-yada-border bg-yada-surface"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">เลขบัตรประชาชน</Label>
                      <Input
                        value={guestInfo.idCard}
                        onChange={(e) => setGuestInfo({ ...guestInfo, idCard: e.target.value })}
                        placeholder="1-xxxx-xxxxx-xx-x"
                        maxLength={17}
                        className="mt-2 h-12 border-yada-border bg-yada-surface"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">หมายเหตุ</Label>
                      <Input
                        value={guestInfo.notes}
                        onChange={(e) => setGuestInfo({ ...guestInfo, notes: e.target.value })}
                        placeholder="ข้อมูลเพิ่มเติม..."
                        className="mt-2 h-12 border-yada-border bg-yada-surface"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button variant="yada-outline" onClick={handleBack} className="h-14 flex-1">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    ย้อนกลับ
                  </Button>
                  <Button
                    variant="yada"
                    onClick={handleNext}
                    disabled={!guestInfo.name || !guestInfo.phone}
                    className="h-14 flex-1 disabled:opacity-40"
                  >
                    ถัดไป
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 4: Payment Method */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="p-5 bg-yada-sand rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-yada-text mb-3">สรุปการจอง</h4>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yada-text-secondary">{selectedRoom?.name_th}</span>
                    <span className="font-medium">{nights} คืน</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>ยอดรวม</span>
                    <span className="text-yada-accent">฿{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-yada-text mb-4">เลือกวิธีชำระเงิน</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'transfer', label: 'โอนเงิน', icon: QrCode },
                      { id: 'cash', label: 'เงินสด', icon: Banknote },
                      { id: 'card', label: 'บัตรเครดิต', icon: CreditCard },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            paymentMethod === m.id
                              ? 'border-yada-primary bg-yada-primary/5'
                              : 'border-gray-200 hover:border-yada-primary/50'
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${paymentMethod === m.id ? 'text-yada-primary' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${paymentMethod === m.id ? 'text-yada-primary' : 'text-gray-600'}`}>
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {paymentMethod === 'transfer' && (
                  <div className="space-y-4 rounded-xl border border-yada-border bg-yada-surface p-5">
                    {settings.bankAccounts?.length > 0 && (
                      <div>
                        <h4 className="mb-3 font-semibold text-yada-text">โอนเข้าบัญชี</h4>
                        {settings.bankAccounts.map((acc, i) => (
                          <div key={i} className="mb-2 flex items-center justify-between gap-2 text-sm">
                            <span className="text-yada-text-secondary">{acc.bankName}</span>
                            <button type="button" onClick={() => copyToClipboard(acc.accountNumber, 'เลขบัญชี')} className="flex items-center gap-1 font-mono font-bold text-yada-text hover:text-yada-primary">
                              {acc.accountNumber} <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <p className="text-sm text-yada-text-secondary">ชื่อบัญชี: {settings.bankAccounts[0]?.accountName}</p>
                      </div>
                    )}
                    {qrCode && (
                      <div className="text-center">
                        <p className="mb-2 font-semibold text-yada-text">สแกน PromptPay</p>
                        <img src={qrCode} alt="PromptPay QR" className="mx-auto h-48 w-48 rounded-lg border border-yada-border" />
                        <p className="mt-2 text-xs text-yada-text-secondary">{settings.promptPayNumber}</p>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <p className="rounded-xl border border-yada-border bg-yada-surface p-4 text-sm text-yada-text-secondary">
                    ชำระเงินสดที่หน้างานเมื่อ check-in เวลา {settings.checkInTime || '14:00'} น.
                  </p>
                )}

                {paymentMethod === 'card' && (
                  <p className="rounded-xl border border-yada-border bg-yada-surface p-4 text-sm text-yada-text-secondary">
                    ติดต่อชำระด้วยบัตรเครดิตที่ {settings.phone || 'เบอร์โทรที่พัก'}
                  </p>
                )}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-yada-border p-4">
                  <Checkbox checked={acceptPrivacy} onCheckedChange={(v) => setAcceptPrivacy(v === true)} />
                  <span className="text-sm text-yada-text-secondary">
                    ยอมรับ <Link to="/privacy" className="text-yada-primary underline">นโยบายความเป็นส่วนตัว</Link> และข้อกำหนดการจอง
                  </span>
                </label>

                <div className="grid gap-3 rounded-xl border border-yada-primary/15 bg-yada-primary/5 p-5 text-sm md:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-yada-primary" />
                    <div>
                      <p className="font-semibold text-yada-text">ตรวจห้องว่างซ้ำ</p>
                      <p className="mt-1 text-yada-text-secondary">ระบบตรวจการจองซ้อนก่อนยืนยัน</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-yada-primary" />
                    <div>
                      <p className="font-semibold text-yada-text">ทีมที่พักติดต่อกลับ</p>
                      <p className="mt-1 text-yada-text-secondary">ยืนยันรายละเอียดภายใน 24 ชั่วโมง</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0 text-yada-primary" />
                    <div>
                      <p className="font-semibold text-yada-text">อัปโหลดสลิปภายหลังได้</p>
                      <p className="mt-1 text-yada-text-secondary">ตรวจสถานะผ่านเบอร์โทรได้ทันที</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button variant="yada-outline" onClick={handleBack} className="h-14 flex-1">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    ย้อนกลับ
                  </Button>
                  <Button variant="yada" onClick={handleSubmit} disabled={loading || !acceptPrivacy} className="h-14 flex-1 disabled:opacity-40">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        กำลังจอง...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        ยืนยันการจอง
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
          </div>

          <BookingSummary
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            children={children}
            nights={nights}
            selectedRoom={selectedRoom}
            totalAmount={totalAmount}
            showNext={step < 4}
            onNext={handleNext}
            nextDisabled={
              (step === 1 && (!checkIn || !checkOut || nights <= 0)) ||
              (step === 2 && !selectedRoomId) ||
              (step === 3 && (!guestInfo.name || !guestInfo.phone)) ||
              loading
            }
          />
        </div>
      </main>
    </div>
    </>
  );
}

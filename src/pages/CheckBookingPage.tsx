import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';
import { Search, Calendar, Users, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Upload, Image, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { useSettingsStore } from '@/stores/store';
import { generatePromptPayQR } from '@/lib/promptpay';
import { bookingStatusConfig, paymentStatusConfig } from '@/lib/statusConfig';
import BookingTimeline from '@/components/booking/BookingTimeline';
import ApiErrorState from '@/components/ApiErrorState';
import { Seo } from '@/lib/seo';

interface BookingResult {
  id: string;
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  rooms: {
    name: string;
    name_th: string;
    price: number;
  };
}

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle,
  'checked-in': CheckCircle,
  'checked-out': CheckCircle,
  cancelled: XCircle,
};

export default function CheckBookingPage() {
  const [searchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResult | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');

  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const generateQR = async () => {
      if (selectedBooking && settings.promptPayNumber) {
        try {
          const qr = await generatePromptPayQR(settings.promptPayNumber, selectedBooking.total_amount);
          setQrCode(qr);
        } catch (error) {
          console.error('QR generation error:', error);
        }
      } else {
        setQrCode('');
      }
    };
    generateQR();
  }, [selectedBooking, settings.promptPayNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setSearched(true);
    setSearchError(false);

    try {
      const { data } = await api.get(`/bookings/by-phone/${phone.trim()}`);
      setBookings(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setBookings([]);
      setSearchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const closePaymentDialog = () => {
    setSelectedBooking(null);
    setSlipFile(null);
    setSlipPreview('');
  };

  const handleUploadSlip = async () => {
    if (!slipFile || !selectedBooking) return;

    if (slipFile.size > 3 * 1024 * 1024) {
      toast.error('ไฟล์มีขนาดใหญ่เกินไป (3MB) กรุณาเลือกไฟล์ที่เล็กกว่านี้');
      return;
    }

    setUploadingSlip(true);
    try {
      const formData = new FormData();
      formData.append('slip', slipFile);
      formData.append('booking_id', selectedBooking.id);
      formData.append('amount', String(selectedBooking.total_amount));
      formData.append('notes', 'รออนุมัติจากแอดมิน');

      try {
        await api.post('/payment-slips/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch {
        await api.post('/payment-slips', {
          booking_id: selectedBooking.id,
          image_url: slipPreview,
          amount: selectedBooking.total_amount,
          status: 'pending',
          notes: 'รออนุมัติจากแอดมิน',
        });
      }

      toast.success('อัปโหลดสลิปสำเร็จ! รอการตรวจสอบจากทางรีสอร์ท');
      closePaymentDialog();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่');
    } finally {
      setUploadingSlip(false);
    }
  };

  const firstBank = settings.bankAccounts?.[0];

  const copyCheckLink = () => {
    const url = `${window.location.origin}/check-booking?phone=${encodeURIComponent(phone.trim())}`;
    navigator.clipboard.writeText(url).then(() => toast.success('คัดลอกลิงก์ตรวจสอบแล้ว'));
  };

  return (
    <>
      <Seo
        title="ตรวจสอบการจองและอัปโหลดสลิป | Yada Homestay"
        description="ตรวจสอบสถานะการจอง Yada Homestay ด้วยเบอร์โทร ดูยอดชำระเงิน และอัปโหลดหลักฐานการโอนสำหรับการเข้าพัก"
        path="/check-booking"
        image="/images/gallery-lobby.jpg"
      />
      <div className="min-h-screen bg-yada-sand pt-28 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <span className="section-label">ตรวจสอบการจอง</span>
            <h1 className="font-display mt-3 text-3xl font-semibold text-yada-text md:text-4xl">
              สถานะการจองของคุณ
            </h1>
            <p className="mt-3 text-yada-text-secondary">
              กรอกเบอร์โทรศัพท์ที่ใช้จองเพื่อดูรายละเอียดและแนบสลิปชำระเงิน
            </p>
          </div>

          <Card className="mb-8 border-yada-accent/20 shadow-yada">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="tel"
                  placeholder="เบอร์โทรศัพท์ เช่น 081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 border-yada-accent/30 bg-yada-surface"
                />
                <Button type="submit" variant="yada" className="h-12 px-8" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      ค้นหา
                    </>
                  )}
                </Button>
                {phone.trim() && (
                  <Button type="button" variant="yada-outline" className="h-12" onClick={copyCheckLink}>
                    <Link2 className="mr-2 h-5 w-5" />
                    แชร์ลิงก์
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {searched && searchError && (
            <ApiErrorState
              title="ไม่สามารถค้นหาได้ในขณะนี้"
              onRetry={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              phone={settings.phone}
              lineUrl={settings.lineUrl}
            />
          )}

          {searched && !searchError && (
            <>
              {bookings.length === 0 ? (
                <Card className="border-yada-accent/20">
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yada-accent/40" />
                    <h3 className="text-xl font-semibold text-yada-text">ไม่พบการจอง</h3>
                    <p className="mt-2 text-yada-text-secondary">
                      ไม่พบการจองที่ตรงกับเบอร์โทรศัพท์นี้ กรุณาตรวจสอบอีกครั้ง
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-yada-text">
                    พบ {bookings.length} รายการ
                  </h3>

                  {bookings.map((booking) => {
                    const status =
                      bookingStatusConfig[booking.status as keyof typeof bookingStatusConfig] ||
                      bookingStatusConfig.pending;
                    const paymentStatus =
                      paymentStatusConfig[booking.payment_status as keyof typeof paymentStatusConfig] ||
                      paymentStatusConfig.pending;
                    const StatusIcon = statusIcons[booking.status] || Clock;

                    return (
                      <Card
                        key={booking.id}
                        className="border-yada-accent/20 transition-shadow hover:shadow-yada"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-yada-text">
                                  {booking.rooms?.name_th || booking.rooms?.name}
                                </h4>
                                <span className="font-mono text-xs text-yada-text-secondary">
                                  #{booking.id.slice(0, 8).toUpperCase()}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-yada-text-secondary">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(parseISO(booking.check_in), 'd MMM yyyy', { locale: th })} –{' '}
                                  {format(parseISO(booking.check_out), 'd MMM yyyy', { locale: th })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-yada-text-secondary">
                                <Users className="h-4 w-4" />
                                <span>
                                  {booking.adults} ผู้ใหญ่
                                  {booking.children > 0 && `, ${booking.children} เด็ก`}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge className={status.color}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {status.label}
                                </Badge>
                                <Badge className={paymentStatus.color}>
                                  <CreditCard className="mr-1 h-3 w-3" />
                                  {paymentStatus.label}
                                </Badge>
                              </div>

                              <div className="mt-4 max-w-xs rounded-xl border border-yada-border bg-yada-sand/50 p-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-yada-text-secondary">
                                  สถานะการจอง
                                </p>
                                <BookingTimeline status={booking.status} paymentStatus={booking.payment_status} />
                              </div>
                            </div>

                            <div className="space-y-3 text-right">
                              <div>
                                <p className="text-2xl font-bold text-yada-primary">
                                  ฿{booking.total_amount?.toLocaleString()}
                                </p>
                                <p className="text-sm text-yada-text-secondary">ยอดรวมทั้งหมด</p>
                              </div>

                              {booking.payment_status === 'pending' && booking.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  variant="yada"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  แนบสลิปชำระเงิน
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && closePaymentDialog()}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-yada-accent/20">
          <DialogHeader>
            <DialogTitle>ชำระเงิน</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="rounded-lg bg-yada-sand p-4">
                <h4 className="font-semibold">{selectedBooking.rooms?.name_th}</h4>
                <p className="text-sm text-yada-text-secondary">
                  {format(parseISO(selectedBooking.check_in), 'd MMM yyyy', { locale: th })} –{' '}
                  {format(parseISO(selectedBooking.check_out), 'd MMM yyyy', { locale: th })}
                </p>
                <p className="mt-2 text-2xl font-bold text-yada-primary">
                  ฿{selectedBooking.total_amount?.toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold">ข้อมูลการชำระเงิน</h5>

                <div className="rounded-lg border border-yada-accent/20 p-4">
                  <p className="mb-2 font-medium">โอนเงินผ่านธนาคาร</p>
                  <div className="space-y-1 text-sm text-yada-text-secondary">
                    <p>
                      ธนาคาร:{' '}
                      <span className="font-medium text-yada-text">
                        {firstBank?.bankName || 'กสิกรไทย'}
                      </span>
                    </p>
                    <p>
                      เลขบัญชี:{' '}
                      <span className="font-medium text-yada-text">
                        {firstBank?.accountNumber || '123-4-56789-0'}
                      </span>
                    </p>
                    <p>
                      ชื่อบัญชี:{' '}
                      <span className="font-medium text-yada-text">
                        {firstBank?.accountName || 'บจก. ยาดาโฮมสเตย์'}
                      </span>
                    </p>
                  </div>
                </div>

                {qrCode && (
                  <div className="rounded-lg border border-yada-accent/20 p-4 text-center">
                    <p className="mb-3 font-medium">สแกน QR Code พร้อมเพย์</p>
                    <img src={qrCode} alt="PromptPay QR" className="mx-auto h-48 w-48" />
                    <p className="mt-2 text-sm text-yada-text-secondary">
                      พร้อมเพย์: {settings.promptPayNumber}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold">แนบหลักฐานการโอนเงิน</h5>

                {slipPreview ? (
                  <div className="relative">
                    <img src={slipPreview} alt="Slip preview" className="w-full rounded-lg border" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setSlipFile(null);
                        setSlipPreview('');
                      }}
                    >
                      ลบ
                    </Button>
                  </div>
                ) : (
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-yada-accent/30 bg-yada-sand hover:bg-yada-surface">
                    <Image className="mb-2 h-8 w-8 text-yada-accent" />
                    <p className="text-sm text-yada-text-secondary">คลิกเพื่อเลือกรูปสลิป</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}

                <Button
                  variant="yada"
                  className="w-full"
                  disabled={!slipFile || uploadingSlip}
                  onClick={handleUploadSlip}
                >
                  {uploadingSlip ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังอัปโหลด...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      ยืนยันการชำระเงิน
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

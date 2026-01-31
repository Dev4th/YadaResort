import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { Search, Calendar, Users, CreditCard, Home, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useSettingsStore } from '@/stores/supabaseStore';
import { generatePromptPayQR } from '@/lib/promptpay';

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

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'รอยืนยัน', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'ยืนยันแล้ว', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  'checked-in': { label: 'เข้าพักแล้ว', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'checked-out': { label: 'เช็คเอาท์แล้ว', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
  cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'รอชำระ', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-700' },
  partial: { label: 'ชำระบางส่วน', color: 'bg-blue-100 text-blue-700' },
  refunded: { label: 'คืนเงินแล้ว', color: 'bg-gray-100 text-gray-700' },
};

export default function CheckBookingPage() {
  const [searchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';
  
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResult | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  
  const { settings } = useSettingsStore();

  // Generate QR code when selectedBooking changes
  useEffect(() => {
    const generateQR = async () => {
      if (selectedBooking && settings.promptPayNumber) {
        try {
          const qr = await generatePromptPayQR(settings.promptPayNumber, selectedBooking.total_amount);
          setQrCode(qr);
        } catch (error) {
          console.error('QR generation error:', error);
        }
      }
    };
    generateQR();
  }, [selectedBooking, settings.promptPayNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, rooms(name, name_th, price)')
        .eq('guest_phone', phone.trim())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setBookings([]);
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

  const handleUploadSlip = async () => {
    if (!slipFile || !selectedBooking) return;
    
    setUploadingSlip(true);
    try {
      // Upload to Supabase Storage (if configured)
      // For now, we'll just record the upload attempt
      const { error } = await supabase
        .from('payment_slips')
        .insert({
          booking_id: selectedBooking.id,
          image_url: slipPreview, // In production, this would be the storage URL
          amount: selectedBooking.total_amount,
          status: 'pending',
          notes: 'รออนุมัติจากแอดมิน'
        });
      
      if (error) throw error;
      
      alert('อัพโหลดสลิปสำเร็จ! รอการตรวจสอบจากทางรีสอร์ท');
      setSlipFile(null);
      setSlipPreview('');
      setSelectedBooking(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('เกิดข้อผิดพลาดในการอัพโหลด กรุณาลองใหม่');
    } finally {
      setUploadingSlip(false);
    }
  };

  // Get first bank account for display
  const firstBank = settings.bankAccounts?.[0];

  return (
    <div className="min-h-screen bg-resort-cream">
      {/* Navbar */}
      <nav className="bg-resort-white shadow-sm border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-semibold text-resort-text">
                Yada Homestay
              </span>
              <span className="text-sm text-resort-accent">
                | ญาดาโฮมสเตย์
              </span>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                หน้าหลัก
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">ตรวจสอบสถานะการจอง</CardTitle>
            <p className="text-gray-500 mt-2">กรอกเบอร์โทรศัพท์ที่ใช้จองเพื่อตรวจสอบสถานะ</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="tel"
                  placeholder="เบอร์โทรศัพท์ เช่น 081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button type="submit" className="h-12 px-8 bg-resort-primary hover:bg-resort-primary-hover" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    ค้นหา
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && (
          <>
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">ไม่พบการจอง</h3>
                  <p className="text-gray-400">
                    ไม่พบการจองที่ตรงกับเบอร์โทรศัพท์นี้<br />
                    กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">พบ {bookings.length} รายการ</h3>
                
                {bookings.map((booking) => {
                  const status = statusConfig[booking.status] || statusConfig.pending;
                  const paymentStatus = paymentStatusConfig[booking.payment_status] || paymentStatusConfig.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-3">
                            {/* Room & Booking ID */}
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-semibold text-resort-text">
                                {booking.rooms?.name_th || booking.rooms?.name}
                              </h4>
                              <span className="text-xs text-gray-400 font-mono">
                                #{booking.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                            
                            {/* Dates */}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(parseISO(booking.check_in), 'd MMM yyyy', { locale: th })} - {format(parseISO(booking.check_out), 'd MMM yyyy', { locale: th })}
                              </span>
                            </div>
                            
                            {/* Guests */}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{booking.adults} ผู้ใหญ่ {booking.children > 0 && `, ${booking.children} เด็ก`}</span>
                            </div>
                            
                            {/* Status Badges */}
                            <div className="flex items-center gap-2">
                              <Badge className={status.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                              <Badge className={paymentStatus.color}>
                                <CreditCard className="w-3 h-3 mr-1" />
                                {paymentStatus.label}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-3">
                            <div>
                              <p className="text-2xl font-bold text-resort-accent">
                                ฿{booking.total_amount?.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-400">ยอดรวมทั้งหมด</p>
                            </div>
                            
                            {booking.payment_status === 'pending' && booking.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                className="bg-resort-primary hover:bg-resort-primary-hover"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Upload className="w-4 h-4 mr-2" />
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

        {/* Payment Dialog */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>ชำระเงิน</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedBooking(null);
                    setSlipFile(null);
                    setSlipPreview('');
                  }}>
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Booking Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{selectedBooking.rooms?.name_th}</h4>
                  <p className="text-sm text-gray-600">
                    {format(parseISO(selectedBooking.check_in), 'd MMM yyyy', { locale: th })} - {format(parseISO(selectedBooking.check_out), 'd MMM yyyy', { locale: th })}
                  </p>
                  <p className="text-2xl font-bold text-resort-accent mt-2">
                    ฿{selectedBooking.total_amount?.toLocaleString()}
                  </p>
                </div>

                {/* Payment Info */}
                <div className="space-y-4">
                  <h5 className="font-semibold">ข้อมูลการชำระเงิน</h5>
                  
                  {/* Bank Transfer */}
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">โอนเงินผ่านธนาคาร</p>
                    <div className="text-sm space-y-1 text-gray-600">
                      <p>ธนาคาร: <span className="font-medium text-gray-800">{firstBank?.bankName || 'กสิกรไทย'}</span></p>
                      <p>เลขบัญชี: <span className="font-medium text-gray-800">{firstBank?.accountNumber || '123-4-56789-0'}</span></p>
                      <p>ชื่อบัญชี: <span className="font-medium text-gray-800">{firstBank?.accountName || 'บจก. ยาดาโฮมสเตย์'}</span></p>
                    </div>
                  </div>

                  {/* PromptPay QR */}
                  {qrCode && (
                    <div className="p-4 border rounded-lg text-center">
                      <p className="font-medium mb-3">สแกน QR Code พร้อมเพย์</p>
                      <img src={qrCode} alt="PromptPay QR" className="w-48 h-48 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">
                        พร้อมเพย์: {settings.promptPayNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Slip */}
                <div className="space-y-3">
                  <h5 className="font-semibold">แนบหลักฐานการโอนเงิน</h5>
                  
                  {slipPreview ? (
                    <div className="relative">
                      <img src={slipPreview} alt="Slip preview" className="w-full rounded-lg border" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSlipFile(null);
                          setSlipPreview('');
                        }}
                      >
                        ลบ
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Image className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">คลิกเพื่อเลือกรูปสลิป</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                  
                  <Button
                    className="w-full bg-resort-primary hover:bg-resort-primary-hover"
                    disabled={!slipFile || uploadingSlip}
                    onClick={handleUploadSlip}
                  >
                    {uploadingSlip ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังอัพโหลด...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        ยืนยันการชำระเงิน
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

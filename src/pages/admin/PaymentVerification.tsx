import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { Check, X, Eye, Search, Filter, Clock, CheckCircle, XCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/supabaseStore';

interface PaymentSlip {
  id: string;
  booking_id: string;
  image_url: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  uploaded_at: string;
  verified_at: string | null;
  verified_by: string | null;
  bookings?: {
    id: string;
    guest_name: string;
    guest_phone: string;
    total_amount: number;
    check_in: string;
    check_out: string;
    rooms?: {
      number: string;
      name_th: string;
    };
  };
}

const statusConfig = {
  pending: { label: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function PaymentVerification() {
  const { user } = useAuthStore();
  const [slips, setSlips] = useState<PaymentSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchSlips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_slips')
        .select(`
          *,
          bookings (
            id,
            guest_name,
            guest_phone,
            total_amount,
            check_in,
            check_out,
            rooms (
              number,
              name_th
            )
          )
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setSlips(data || []);
    } catch (error) {
      console.error('Error fetching payment slips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, []);

  const handleApprove = async (slip: PaymentSlip) => {
    setActionLoading(true);
    try {
      // Update slip status
      const { error: slipError } = await supabase
        .from('payment_slips')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq('id', slip.id);

      if (slipError) throw slipError;

      // Update booking payment status
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', slip.booking_id);

      await fetchSlips();
      setViewDialogOpen(false);
      setSelectedSlip(null);
    } catch (error) {
      console.error('Error approving slip:', error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (slip: PaymentSlip) => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('payment_slips')
        .update({
          status: 'rejected',
          notes: rejectReason,
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq('id', slip.id);

      if (error) throw error;

      await fetchSlips();
      setViewDialogOpen(false);
      setSelectedSlip(null);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting slip:', error);
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSlips = slips.filter(slip => {
    const matchesSearch = 
      slip.bookings?.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slip.bookings?.guest_phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || slip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = slips.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-resort-text">ตรวจสอบการชำระเงิน</h1>
          <p className="text-resort-text-secondary">ตรวจสอบและอนุมัติสลิปการโอนเงิน</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-yellow-100 text-yellow-700 text-sm py-1 px-3">
            รอตรวจสอบ {pendingCount} รายการ
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="pending">รอตรวจสอบ</SelectItem>
                <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                <SelectItem value="rejected">ปฏิเสธ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Slips List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-resort-primary" />
        </div>
      ) : filteredSlips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบรายการสลิปการโอนเงิน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSlips.map((slip) => {
            const StatusIcon = statusConfig[slip.status].icon;
            return (
              <Card key={slip.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {slip.image_url ? (
                        <img 
                          src={slip.image_url} 
                          alt="Payment slip" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-resort-text">
                            {slip.bookings?.guest_name || 'ไม่ระบุชื่อ'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {slip.bookings?.guest_phone}
                          </p>
                        </div>
                        <Badge className={statusConfig[slip.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[slip.status].label}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span>ห้อง {slip.bookings?.rooms?.number}</span>
                        <span>•</span>
                        <span>ยอด ฿{slip.amount?.toLocaleString()}</span>
                        <span>•</span>
                        <span>
                          {slip.uploaded_at && format(parseISO(slip.uploaded_at), 'd MMM yyyy HH:mm', { locale: th })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSlip(slip);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        ดูรายละเอียด
                      </Button>
                      {slip.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(slip)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedSlip(slip);
                              setViewDialogOpen(true);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>รายละเอียดสลิปการโอนเงิน</DialogTitle>
          </DialogHeader>

          {selectedSlip && (
            <div className="space-y-4">
              {/* Slip Image */}
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {selectedSlip.image_url ? (
                  <img 
                    src={selectedSlip.image_url} 
                    alt="Payment slip" 
                    className="w-full max-h-96 object-contain"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">ชื่อลูกค้า</p>
                  <p className="font-medium">{selectedSlip.bookings?.guest_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">เบอร์โทร</p>
                  <p className="font-medium">{selectedSlip.bookings?.guest_phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">ห้องพัก</p>
                  <p className="font-medium">
                    {selectedSlip.bookings?.rooms?.number} - {selectedSlip.bookings?.rooms?.name_th}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">วันที่เข้าพัก</p>
                  <p className="font-medium">
                    {selectedSlip.bookings?.check_in && format(parseISO(selectedSlip.bookings.check_in), 'd MMM yyyy', { locale: th })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">ยอดที่ต้องชำระ</p>
                  <p className="font-medium text-resort-accent">
                    ฿{selectedSlip.bookings?.total_amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">ยอดในสลิป</p>
                  <p className="font-medium">฿{selectedSlip.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">วันที่อัพโหลด</p>
                  <p className="font-medium">
                    {selectedSlip.uploaded_at && format(parseISO(selectedSlip.uploaded_at), 'd MMM yyyy HH:mm', { locale: th })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">สถานะ</p>
                  <Badge className={statusConfig[selectedSlip.status].color}>
                    {statusConfig[selectedSlip.status].label}
                  </Badge>
                </div>
              </div>

              {/* Reject Reason Input (only for pending) */}
              {selectedSlip.status === 'pending' && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">เหตุผลในการปฏิเสธ (ถ้าต้องการปฏิเสธ)</p>
                  <Textarea
                    placeholder="ระบุเหตุผล เช่น ยอดไม่ตรง, สลิปไม่ชัด..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}

              {/* Notes */}
              {selectedSlip.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">หมายเหตุ</p>
                  <p className="text-sm">{selectedSlip.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedSlip?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                  disabled={actionLoading}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedSlip)}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                  ปฏิเสธ
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedSlip)}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  อนุมัติ
                </Button>
              </>
            )}
            {selectedSlip?.status !== 'pending' && (
              <Button onClick={() => setViewDialogOpen(false)}>
                ปิด
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CreditCard, Sparkles, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/admin/PageHeader';
import api from '@/lib/api';
import { useRoomStore } from '@/stores/store';

type PaymentSlip = {
  id: string;
  booking_id: string | null;
  amount: string | number | null;
  status: string;
  uploaded_at: string;
  booking?: {
    guest_name: string;
    guest_phone: string;
  };
};

export default function Operations() {
  const { rooms, fetchRooms } = useRoomStore();
  const [slips, setSlips] = useState<PaymentSlip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [slipRes] = await Promise.all([
          api.get('/payment-slips', { params: { status: 'pending' } }),
          fetchRooms(),
        ]);
        setSlips(slipRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchRooms]);

  const cleaningRooms = useMemo(() => rooms.filter((room) => room.status === 'cleaning'), [rooms]);
  const maintenanceRooms = useMemo(() => rooms.filter((room) => room.status === 'maintenance'), [rooms]);
  const totalQueue = slips.length + cleaningRooms.length + maintenanceRooms.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="คิวงานปฏิบัติการ"
        subtitle="รวมงานที่ต้องปิดก่อนขายห้องหรือยืนยันการเข้าพัก"
        actions={<Badge className="bg-yada-primary px-3 py-1 text-white">{totalQueue} งานค้าง</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-5">
            <CreditCard className="mb-4 h-6 w-6 text-blue-700" />
            <p className="text-3xl font-bold text-blue-900">{slips.length}</p>
            <p className="text-sm font-medium text-blue-700">สลิปรอตรวจ</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50">
          <CardContent className="p-5">
            <Sparkles className="mb-4 h-6 w-6 text-emerald-700" />
            <p className="text-3xl font-bold text-emerald-900">{cleaningRooms.length}</p>
            <p className="text-sm font-medium text-emerald-700">ห้องรอทำความสะอาด</p>
          </CardContent>
        </Card>
        <Card className="border-rose-100 bg-rose-50">
          <CardContent className="p-5">
            <Wrench className="mb-4 h-6 w-6 text-rose-700" />
            <p className="text-3xl font-bold text-rose-900">{maintenanceRooms.length}</p>
            <p className="text-sm font-medium text-rose-700">ห้องซ่อมบำรุง</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">กำลังโหลดคิวงาน...</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
                สลิปรอตรวจ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {slips.length === 0 ? (
                <p className="text-sm text-gray-500">ไม่มีสลิปรอตรวจ</p>
              ) : (
                slips.map((slip) => (
                  <div key={slip.id} className="rounded-lg border border-gray-100 p-3">
                    <p className="font-semibold">{slip.booking?.guest_name || 'ไม่ระบุชื่อ'}</p>
                    <p className="text-xs text-gray-500">{slip.booking?.guest_phone || slip.booking_id}</p>
                    <p className="mt-2 text-sm text-yada-accent">฿{Number(slip.amount || 0).toLocaleString()}</p>
                  </div>
                ))
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/payment-verify">
                  ไปตรวจสลิป <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                ห้องรอแม่บ้าน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cleaningRooms.length === 0 ? (
                <p className="text-sm text-gray-500">ไม่มีห้องรอทำความสะอาด</p>
              ) : (
                cleaningRooms.map((room) => (
                  <div key={room.id} className="rounded-lg border border-gray-100 p-3">
                    <p className="font-semibold">{room.name_th || room.name}</p>
                    <p className="text-xs text-gray-500">{room.name}</p>
                  </div>
                ))
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/cleaning">
                  ไปงานแม่บ้าน <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                ห้องซ่อมบำรุง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {maintenanceRooms.length === 0 ? (
                <p className="text-sm text-gray-500">ไม่มีห้องซ่อมบำรุง</p>
              ) : (
                maintenanceRooms.map((room) => (
                  <div key={room.id} className="rounded-lg border border-gray-100 p-3">
                    <p className="font-semibold">{room.name_th || room.name}</p>
                    <p className="text-xs text-gray-500">ห้องนี้ยังไม่ควรขายจนกว่าจะปิดงาน</p>
                  </div>
                ))
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/maintenance">
                  ไปงานซ่อม <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

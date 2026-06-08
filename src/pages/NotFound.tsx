import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Seo } from '@/lib/seo';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-yada-sand to-yada-surface p-4 pt-28">
      <Seo
        title="ไม่พบหน้าที่ต้องการ | Yada Homestay"
        description="ไม่พบหน้าที่คุณต้องการ กลับไปหน้าแรกหรือเลือกจองห้องพักกับ Yada Homestay"
        path="/404"
        noIndex
      />
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="relative">
            <h1 className="select-none text-[150px] font-bold leading-none text-yada-primary/10">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yada-primary/10">
                <Search className="h-12 w-12 text-yada-primary" />
              </div>
            </div>
          </div>
        </div>

        <h2 className="font-display mb-3 text-2xl font-bold text-yada-text">
          ไม่พบหน้าที่คุณต้องการ
        </h2>
        <p className="mb-8 text-yada-text-secondary">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่มีอยู่จริง
          <br />
          กรุณาตรวจสอบ URL อีกครั้ง
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="yada-outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>
          <Button variant="yada" onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            กลับหน้าหลัก
          </Button>
        </div>

        <div className="mt-12 border-t border-yada-accent/20 pt-8">
          <p className="mb-4 text-sm text-yada-text-secondary">ลิงก์ที่อาจเป็นประโยชน์</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="yada-ghost" size="sm" onClick={() => navigate('/')}>
              หน้าหลัก
            </Button>
            <Button variant="yada-ghost" size="sm" onClick={() => navigate('/booking')}>
              จองห้องพัก
            </Button>
            <Button variant="yada-ghost" size="sm" onClick={() => navigate('/check-booking')}>
              ตรวจสอบการจอง
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

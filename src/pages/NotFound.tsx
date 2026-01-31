import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-resort-primary/5 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-[150px] font-bold text-resort-primary/10 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-resort-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-resort-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-resort-text mb-3">
          ไม่พบหน้าที่คุณต้องการ
        </h2>
        <p className="text-resort-text-secondary mb-8">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่มีอยู่จริง
          <br />
          กรุณาตรวจสอบ URL อีกครั้ง
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2 bg-resort-primary hover:bg-resort-primary-hover"
          >
            <Home className="w-4 h-4" />
            กลับหน้าหลัก
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-resort-text-secondary mb-4">
            ลิงก์ที่อาจเป็นประโยชน์
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-resort-primary hover:text-resort-primary-hover"
            >
              หน้าหลัก
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/booking')}
              className="text-resort-primary hover:text-resort-primary-hover"
            >
              จองห้องพัก
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/check-booking')}
              className="text-resort-primary hover:text-resort-primary-hover"
            >
              ตรวจสอบการจอง
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

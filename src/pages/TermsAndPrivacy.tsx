import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/stores/store';
import { Seo } from '@/lib/seo';

export default function TermsAndPrivacy() {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yada-sand to-yada-surface pt-24">
      <Seo
        title="ข้อกำหนดและนโยบายความเป็นส่วนตัว | Yada Homestay"
        description="อ่านข้อกำหนดการจอง การเข้าพัก การยกเลิก และนโยบายความเป็นส่วนตัวของ Yada Homestay"
        path="/terms"
      />
      {/* Header */}
      <div className="bg-yada-dark py-10 text-white">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Button>
          <h1 className="font-display text-3xl font-bold">ข้อกำหนดและนโยบายความเป็นส่วนตัว</h1>
          <p className="mt-2 text-yada-accent">Yada Homestay</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Terms of Service */}
        <section className="mb-12">
          <h2 className="font-display mb-6 border-b border-yada-primary/20 pb-2 text-2xl font-bold text-yada-text">
            ข้อกำหนดการใช้บริการ
          </h2>
          
          <div className="space-y-6 text-yada-text-secondary leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">1. การจองห้องพัก</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>การจองจะสมบูรณ์เมื่อได้รับการยืนยันจากทางรีสอร์ทเท่านั้น</li>
                <li>กรุณาตรวจสอบรายละเอียดการจองก่อนชำระเงิน</li>
                <li>ราคาห้องพักรวมอาหารเช้าและสิ่งอำนวยความสะดวกพื้นฐาน</li>
                <li>ผู้เข้าพักต้องมีอายุ 18 ปีบริบูรณ์ขึ้นไป</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">2. การเช็คอิน/เช็คเอาท์</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>เวลาเช็คอิน: 14:00 น. เป็นต้นไป</li>
                <li>เวลาเช็คเอาท์: ก่อน 12:00 น.</li>
                <li>การเช็คอินก่อนเวลาหรือเช็คเอาท์หลังเวลา อาจมีค่าใช้จ่ายเพิ่มเติม</li>
                <li>กรุณาแสดงบัตรประชาชนหรือหนังสือเดินทางเมื่อเช็คอิน</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">3. นโยบายการยกเลิก</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ยกเลิกก่อน 7 วัน: คืนเงินเต็มจำนวน</li>
                <li>ยกเลิกก่อน 3-7 วัน: คืนเงิน 50%</li>
                <li>ยกเลิกน้อยกว่า 3 วัน: ไม่คืนเงิน</li>
                <li>กรณี No-show: ไม่คืนเงินและเรียกเก็บค่าห้องเต็มจำนวน</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">4. กฎระเบียบภายในรีสอร์ท</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>งดสูบบุหรี่ในห้องพักและพื้นที่ส่วนกลาง</li>
                <li>ห้ามนำสัตว์เลี้ยงเข้าพักโดยไม่ได้รับอนุญาต</li>
                <li>ห้ามส่งเสียงดังหลัง 22:00 น.</li>
                <li>ห้ามนำอาหารจากภายนอกเข้ามารับประทานในห้องอาหาร</li>
                <li>กรุณารักษาความสะอาดและทรัพย์สินส่วนรวม</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">5. ความรับผิดชอบ</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ทางรีสอร์ทไม่รับผิดชอบต่อทรัพย์สินมีค่าที่สูญหาย</li>
                <li>กรุณาเก็บรักษาทรัพย์สินมีค่าในตู้เซฟหรือฝากที่ประชาสัมพันธ์</li>
                <li>ความเสียหายที่เกิดจากผู้เข้าพัก ผู้เข้าพักต้องรับผิดชอบ</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="mb-12">
          <h2 className="font-display mb-6 border-b border-yada-primary/20 pb-2 text-2xl font-bold text-yada-text">
            นโยบายความเป็นส่วนตัว
          </h2>
          
          <div className="space-y-6 text-yada-text-secondary leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h3>
              <p className="mb-3">เราเก็บรวบรวมข้อมูลส่วนบุคคลเมื่อท่านทำการจองห้องพัก ได้แก่:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ชื่อ-นามสกุล</li>
                <li>หมายเลขโทรศัพท์</li>
                <li>ที่อยู่อีเมล</li>
                <li>เลขบัตรประชาชน/หนังสือเดินทาง (เพื่อการเช็คอิน)</li>
                <li>ข้อมูลการชำระเงิน</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">2. วัตถุประสงค์ในการใช้ข้อมูล</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ดำเนินการจองห้องพักและให้บริการ</li>
                <li>ติดต่อสื่อสารเกี่ยวกับการจอง</li>
                <li>ปรับปรุงคุณภาพการบริการ</li>
                <li>ส่งโปรโมชันและข่าวสาร (หากท่านให้ความยินยอม)</li>
                <li>ปฏิบัติตามกฎหมายที่เกี่ยวข้อง</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">3. การเปิดเผยข้อมูล</h3>
              <p>เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอก ยกเว้นในกรณี:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>ได้รับความยินยอมจากท่าน</li>
                <li>จำเป็นต่อการให้บริการ (เช่น ผู้ให้บริการชำระเงิน)</li>
                <li>ปฏิบัติตามคำสั่งศาลหรือหน่วยงานราชการ</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">4. การรักษาความปลอดภัยข้อมูล</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม</li>
                <li>การเข้าถึงข้อมูลจำกัดเฉพาะพนักงานที่เกี่ยวข้อง</li>
                <li>ข้อมูลถูกเข้ารหัสเมื่อส่งผ่านอินเทอร์เน็ต</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">5. สิทธิ์ของท่าน</h3>
              <p>ภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ท่านมีสิทธิ์:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>เข้าถึงและขอสำเนาข้อมูลของท่าน</li>
                <li>ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                <li>ขอลบข้อมูล (ภายใต้เงื่อนไขที่กฎหมายกำหนด)</li>
                <li>คัดค้านการประมวลผลข้อมูล</li>
                <li>ถอนความยินยอม</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">6. ระยะเวลาการเก็บรักษาข้อมูล</h3>
              <p>เราจะเก็บรักษาข้อมูลของท่านตามระยะเวลาที่กฎหมายกำหนด หรือตามความจำเป็นในการให้บริการ</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yada-text mb-3">7. คุกกี้และการติดตาม</h3>
              <p>เว็บไซต์ของเราอาจใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งาน ท่านสามารถปิดการใช้งานคุกกี้ได้ในการตั้งค่าเบราว์เซอร์</p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-xl bg-yada-sand p-6 ring-1 ring-yada-accent/20">
          <h2 className="text-xl font-bold text-yada-text mb-4">ติดต่อเรา</h2>
          <p className="text-yada-text-secondary mb-4">
            หากท่านมีคำถามเกี่ยวกับข้อกำหนดหรือนโยบายความเป็นส่วนตัว กรุณาติดต่อ:
          </p>
          <div className="space-y-2 text-yada-text-secondary">
            <p><strong>{settings.hotelName || 'Yada Homestay'}</strong></p>
            <p>📧 Email: {settings.email || 'contact@yadahomestay.com'}</p>
            <p>📞 โทร: {settings.phone || '081-234-5678'}</p>
            <p>📍 {settings.address || '80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000'}</p>
          </div>
        </section>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>ปรับปรุงล่าสุด: มกราคม 2568</p>
        </div>
      </div>
    </div>
  );
}

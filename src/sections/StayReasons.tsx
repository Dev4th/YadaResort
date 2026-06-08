import { Link } from 'react-router-dom';
import { ArrowRight, Heart, MapPinned, ShieldCheck, Sparkles, Users, Wifi } from 'lucide-react';
import SectionShell from '@/components/SectionShell';

const reasons = [
  {
    icon: Heart,
    title: 'พักแบบเป็นกันเอง',
    text: 'บรรยากาศโฮมสเตย์ที่ดูแลง่าย ไม่แข็งเหมือนโรงแรมใหญ่ แต่ยังสะอาดและเป็นระบบ',
  },
  {
    icon: MapPinned,
    title: 'ฐานพักในเพชรบุรี',
    text: 'เหมาะสำหรับคนที่อยากเที่ยวเมืองเพชรบุรี แวะพักระหว่างทาง หรือวางทริปสั้น ๆ',
  },
  {
    icon: ShieldCheck,
    title: 'จองตรงมั่นใจกว่า',
    text: 'ดูห้องว่าง ส่งข้อมูล และตรวจสอบสถานะการจองได้ผ่านระบบของที่พักโดยตรง',
  },
  {
    icon: Wifi,
    title: 'สิ่งจำเป็นครบ',
    text: 'WiFi เครื่องปรับอากาศ น้ำอุ่น และห้องหลายขนาดสำหรับคู่รัก ครอบครัว หรือกลุ่มเพื่อน',
  },
];

const tripTypes = [
  { label: 'ทริปคู่รัก', href: '/pool-villa-phetchaburi', icon: Sparkles },
  { label: 'ทริปครอบครัว', href: '/family-room-phetchaburi', icon: Users },
  { label: 'โฮมสเตย์เพชรบุรี', href: '/phetchaburi-homestay', icon: MapPinned },
  { label: 'เที่ยวใกล้ที่พัก', href: '/nearby-attractions', icon: ArrowRight },
];

export default function StayReasons() {
  return (
    <section id="why-yada" className="bg-yada-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionShell
            label="Why Yada"
            title="ที่พักเพชรบุรีที่ทำให้การตัดสินใจง่ายขึ้น"
            subtitle="เราเน้นสิ่งที่ลูกค้าต้องรู้ก่อนจองจริง: ห้องแบบไหนเหมาะกับใคร ราคาเห็นชัด ติดต่อได้ง่าย และมีระบบตรวจสอบการจองหลังชำระเงิน"
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tripTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Link
                  key={type.href}
                  to={type.href}
                  className="group flex items-center justify-between rounded-lg border border-yada-accent/25 bg-yada-sand px-4 py-4 text-sm font-semibold text-yada-text transition hover:border-yada-primary hover:bg-white"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-yada-primary" />
                    {type.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-yada-accent transition group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <article key={reason.title} className="rounded-lg border border-yada-accent/15 bg-yada-sand p-6 shadow-sm">
                <Icon className="mb-5 h-7 w-7 text-yada-primary" />
                <h3 className="text-lg font-semibold text-yada-text">{reason.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-yada-text-secondary">{reason.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

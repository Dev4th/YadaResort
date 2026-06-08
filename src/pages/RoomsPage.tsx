import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Rooms from '@/sections/Rooms';
import StayReasons from '@/sections/StayReasons';
import { Seo, lodgingStructuredData } from '@/lib/seo';

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-yada-surface pt-24">
      <Seo
        title="ห้องพัก Yada Homestay เพชรบุรี"
        description="ดูประเภทห้องพัก Yada Homestay เพชรบุรี ทั้งห้องมาตรฐาน ห้องครอบครัว และพูลวิลล่า พร้อมราคา ความจุ สิ่งอำนวยความสะดวก และปุ่มจองออนไลน์"
        path="/rooms"
        image="/images/room-deluxe.jpg"
        structuredData={lodgingStructuredData}
      />
      <section className="relative overflow-hidden bg-yada-dark px-4 pb-16 pt-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowRight className="h-4 w-4 rotate-180" />
            กลับหน้าแรก
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-yada-accent">Rooms & Villas</p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            เลือกห้องพักที่เข้ากับจังหวะทริปของคุณ
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/75">
            ดูราคา ความจุ และสิ่งอำนวยความสะดวกก่อนจอง เพื่อให้ทริปเพชรบุรีของคุณเริ่มง่ายตั้งแต่เลือกห้อง
          </p>
        </div>
      </section>
      <Rooms />
      <StayReasons />
    </main>
  );
}

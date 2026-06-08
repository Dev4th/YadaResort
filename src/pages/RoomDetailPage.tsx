import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BedDouble, Check, MapPin, Maximize2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StayReasons from '@/sections/StayReasons';
import { useSettingsStore } from '@/stores/store';
import { Seo, lodgingStructuredData, SITE_URL } from '@/lib/seo';
import { buildBookingUrl } from '@/lib/bookingDraft';
import { roomIdFromSlug } from '@/lib/roomSlug';
import { useRoomStore } from '@/stores/store';
import type { Room } from '@/stores/store';

function getRoomImage(room?: Room) {
  const image = room?.images?.[0];
  if (image && image.length > 5) return image;
  const name = (room?.name || '').toLowerCase();
  if (name.includes('villa') || name.includes('pool')) return '/images/room-villa.jpg';
  if (name.includes('family') || name.includes('suite')) return '/images/room-family.jpg';
  if (name.includes('deluxe')) return '/images/room-deluxe.jpg';
  return '/images/room-standard.jpg';
}

export default function RoomDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const roomIdPrefix = roomIdFromSlug(slug);
  const { rooms, fetchRooms } = useRoomStore();
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (rooms.length === 0) fetchRooms();
  }, [fetchRooms, rooms.length]);

  const room = useMemo(
    () => rooms.find((item) => item.id.startsWith(roomIdPrefix)) || null,
    [roomIdPrefix, rooms]
  );

  const roomImage = getRoomImage(room || undefined);
  const title = room
    ? `${room.name_th || room.name} | ห้องพัก Yada Homestay เพชรบุรี`
    : 'ห้องพัก Yada Homestay เพชรบุรี';
  const description = room
    ? `${room.name_th || room.name} ราคาเริ่มต้น ฿${Number(room.price).toLocaleString()} ต่อคืน รองรับ ${room.capacity} ท่าน พร้อมสิ่งอำนวยความสะดวกสำหรับทริปเพชรบุรี`
    : 'ดูรายละเอียดห้องพัก Yada Homestay เพชรบุรี พร้อมราคา ความจุ สิ่งอำนวยความสะดวก และปุ่มจองออนไลน์';

  const structuredData = room
    ? [
        lodgingStructuredData,
        {
          '@context': 'https://schema.org',
          '@type': 'HotelRoom',
          name: room.name_th || room.name,
          description: room.description_th || room.description || description,
          image: `${SITE_URL}${roomImage}`,
          occupancy: {
            '@type': 'QuantitativeValue',
            maxValue: room.capacity,
          },
          offers: {
            '@type': 'Offer',
            price: Number(room.price),
            priceCurrency: 'THB',
            availability: room.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          },
        },
      ]
    : lodgingStructuredData;

  if (!room) {
    return (
      <main className="min-h-screen bg-yada-sand pt-24">
        <Seo title={title} description={description} path={`/rooms/${slug || ''}`} noIndex />
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-3xl font-semibold text-yada-text">ไม่พบห้องพักนี้</h1>
          <p className="mt-3 text-yada-text-secondary">ห้องพักอาจถูกย้ายหรือยังโหลดข้อมูลไม่เสร็จ</p>
          <Button asChild variant="yada" className="mt-6">
            <Link to="/rooms">กลับไปดูห้องพักทั้งหมด</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yada-surface pt-24">
      <Seo
        title={title}
        description={description}
        path={`/rooms/${slug}`}
        image={roomImage}
        structuredData={structuredData}
      />
      <section className="relative min-h-[70vh] overflow-hidden">
        <img src={roomImage} alt={room.name_th || room.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-28 text-white sm:px-6 lg:px-8">
          <Link to="/rooms" className="mb-8 inline-flex w-fit items-center gap-2 text-sm text-white/75 hover:text-white">
            <ArrowRight className="h-4 w-4 rotate-180" />
            ห้องพักทั้งหมด
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-yada-accent">Room Detail</p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{room.name_th || room.name}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{room.description_th || room.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="yada" onClick={() => navigate(buildBookingUrl(room.id))} className="px-7 py-6 text-base">
              จองห้องนี้
            </Button>
            <Button asChild variant="yada-outline" className="border-white bg-white/10 px-7 py-6 text-base text-white hover:bg-white hover:text-yada-text">
              <a href={`tel:${(settings.phone || '0812345678').replace(/-/g, '')}`}>โทรสอบถาม</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="rounded-xl border border-yada-accent/20 bg-yada-sand p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yada-accent">Price</p>
          <p className="mt-3 text-4xl font-bold text-yada-primary">฿{Number(room.price).toLocaleString()}</p>
          <p className="mt-1 text-yada-text-secondary">ต่อคืน</p>
          <div className="mt-6 grid gap-3 text-sm text-yada-text">
            <div className="flex items-center gap-3"><Users className="h-5 w-5 text-yada-primary" /> รองรับ {room.capacity} ท่าน</div>
            <div className="flex items-center gap-3"><Maximize2 className="h-5 w-5 text-yada-primary" /> {room.size || '-'} ตร.ม.</div>
            <div className="flex items-center gap-3"><BedDouble className="h-5 w-5 text-yada-primary" /> {room.bed_type || 'เตียงมาตรฐาน'}</div>
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-yada-primary" /> {room.view || 'บรรยากาศโฮมสเตย์'}</div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-3xl font-semibold text-yada-text">สิ่งอำนวยความสะดวก</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(room.amenities || []).map((amenity) => (
              <div key={amenity} className="flex items-center gap-3 rounded-lg border border-yada-accent/15 bg-white p-4 shadow-sm">
                <Check className="h-5 w-5 text-yada-primary" />
                <span className="text-yada-text-secondary">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <StayReasons />
    </main>
  );
}

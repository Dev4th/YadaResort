import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Check, Wifi, Tv, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRoomStore } from '@/stores/supabaseStore';
import type { Room } from '@/stores/supabaseStore';

gsap.registerPlugin(ScrollTrigger);

// Get room type label
const getRoomTypeLabel = (name: string): string => {
  if (name.toLowerCase().includes('deluxe')) return 'ดีลักซ์';
  if (name.toLowerCase().includes('family') || name.toLowerCase().includes('suite')) return 'แฟมิลี่';
  if (name.toLowerCase().includes('standard')) return 'มาตรฐาน';
  return 'มาตรฐาน';
};

export default function Rooms() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const { rooms, fetchRooms } = useRoomStore();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rooms-header',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.room-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.rooms-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [rooms]);

  const handleBookRoom = (room: Room) => {
    navigate(`/booking?room=${room.id}`);
  };

  return (
    <section
      id="rooms"
      ref={sectionRef}
      className="py-20 lg:py-32 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="rooms-header text-center mb-16">
          <span className="text-[#c9a962] text-sm font-medium tracking-wider uppercase mb-2 block">
            ห้องพักของเรา
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#1a1a1a] mb-4">
            เลือกห้องพักที่ใช่สำหรับคุณ
          </h2>
          <p className="text-[#666] max-w-2xl mx-auto">
            ห้องพักหลากหลายสไตล์ให้เลือกสรร ตั้งแต่ห้องมาตรฐานไปจนถึงห้องแฟมิลี่สุดหรู
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="rooms-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => {
            const roomType = getRoomTypeLabel(room.name || '');
            const isHovered = hoveredRoom === room.id;
            
            return (
              <div
                key={room.id}
                className="room-card group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <img
                    src={room.images?.[0] || '/images/room-standard.jpg'}
                    alt={room.name_th}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Room type label */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#1a1a1a] text-xs font-medium rounded-full">
                      {roomType}
                    </span>
                  </div>
                  
                  {/* Hover overlay with Book button */}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <Button
                      onClick={() => handleBookRoom(room)}
                      className="bg-white text-[#1a1a1a] hover:bg-gray-100 px-6 py-2 rounded-full font-medium"
                      disabled={room.status !== 'available'}
                    >
                      จองเลย
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3">
                    {room.name}
                  </h3>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      <Wifi className="w-3 h-3" />
                      Wifi
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      <Tv className="w-3 h-3" />
                      TV
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      <Wind className="w-3 h-3" />
                      AC
                    </span>
                  </div>

                  {/* Price and Capacity */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xl font-bold text-[#1a1a1a]">
                        ฿{room.price?.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">/คืน</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{room.capacity} ท่าน</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Room Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRoom && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  {selectedRoom.name_th}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <img
                  src={selectedRoom.images?.[0] || '/images/room-standard.jpg'}
                  alt={selectedRoom.name_th}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-[#1a1a1a]">
                    ฿{selectedRoom.price?.toLocaleString()}
                    <span className="text-lg text-[#666]">/คืน</span>
                  </span>
                </div>
                <p className="text-[#666] mb-6">{selectedRoom.description_th}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-[#f5f5f5] rounded-xl">
                    <Users className="w-6 h-6 mb-2 text-[#c9a962]" />
                    <span className="text-sm text-[#666]">{selectedRoom.capacity} ท่าน</span>
                  </div>
                  <div className="p-4 bg-[#f5f5f5] rounded-xl">
                    <span className="text-sm text-[#666]">{selectedRoom.size} ตร.ม.</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">สิ่งอำนวยความสะดวก</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRoom.amenities?.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#c9a962]" />
                        <span className="text-sm text-[#666]">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setDetailOpen(false);
                    navigate(`/booking?room=${selectedRoom.id}`);
                  }}
                  className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white py-3 rounded-lg"
                  disabled={selectedRoom.status !== 'available'}
                >
                  {selectedRoom.status === 'available' ? 'จองห้องนี้' : 'ไม่ว่าง'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

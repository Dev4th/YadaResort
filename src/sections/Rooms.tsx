import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Check, Wifi, Tv, Wind, Car, Coffee, Utensils, Bed } from 'lucide-react';
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

// Amenity mapping with icons - new format only
const AMENITY_CONFIG: Record<string, { icon: any; label: string }> = {
  wifi: { icon: Wifi, label: 'Wifi' },
  tv: { icon: Tv, label: 'TV' },
  aircon: { icon: Wind, label: 'AC' },
  parking: { icon: Car, label: 'ที่จอดรถ' },
  coffee: { icon: Coffee, label: 'กาแฟ' },
  minibar: { icon: Utensils, label: 'มินิบาร์' },
  balcony: { icon: Wind, label: 'ระเบียง' },
  bathtub: { icon: Coffee, label: 'อ่างอาบน้ำ' },
  safe: { icon: Bed, label: 'ตู้เซฟ' },
  fridge: { icon: Utensils, label: 'ตู้เย็น' },
  hotwater: { icon: Coffee, label: 'น้ำอุ่น' },
  workdesk: { icon: Bed, label: 'โต๊ะทำงาน' },
  kitchenette: { icon: Utensils, label: 'ครัวเล็ก' },
  privatepool: { icon: Car, label: 'สระส่วนตัว' },
  fullkitchen: { icon: Utensils, label: 'ครัว' },
  outdoorshower: { icon: Coffee, label: 'ฝักบัวกลางแจ้ง' },
};

// Map old format to new format for display
const mapAmenityId = (id: string): string => {
  const mapping: Record<string, string> = {
    'WiFi': 'wifi',
    'TV': 'tv',
    'Air Conditioning': 'aircon',
    'Hot Water': 'hotwater',
    'Work Desk': 'workdesk',
    'Balcony': 'balcony',
    'Mini Bar': 'minibar',
    'Kitchenette': 'kitchenette',
    'Private Pool': 'privatepool',
    'Full Kitchen': 'fullkitchen',
    'Outdoor Shower': 'outdoorshower',
  };
  return mapping[id] || id;
};

// Get room type label
const getRoomTypeLabel = (name: string): string => {
  if (name.toLowerCase().includes('deluxe')) return 'ดีลักซ์';
  if (name.toLowerCase().includes('family') || name.toLowerCase().includes('suite')) return 'แฟมิลี่';
  if (name.toLowerCase().includes('standard')) return 'มาตรฐาน';
  return 'มาตรฐาน';
};

// Get room image based on type if database image is missing or broken
const getRoomImage = (room: Room): string => {
  // If database image exists, use it (simplified check, real app might check for valid URL)
  if (room.images && room.images.length > 0 && room.images[0] && room.images[0].length > 5) {
    return room.images[0];
  }
  
  // Fallback to local images based on name
  const name = (room.name || '').toLowerCase();
  
  if (name.includes('villa') || name.includes('pool')) {
    return '/images/room-villa.jpg';
  }
  if (name.includes('family') || name.includes('suite')) {
    return '/images/room-family.jpg';
  }
  if (name.includes('deluxe')) {
    return '/images/room-deluxe.jpg';
  }
  
  // Default fallback
  return '/images/room-standard.jpg';
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
      className="py-20 lg:py-32 bg-resort-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="rooms-header text-center mb-16">
          <span className="text-resort-accent text-sm font-medium tracking-wider uppercase mb-2 block">
            ห้องพักของเรา
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold text-resort-text mb-4">
            เลือกห้องพักที่ใช่สำหรับคุณ
          </h2>
          <p className="text-resort-text-secondary max-w-2xl mx-auto">
            ห้องพักหลากหลายสไตล์ให้เลือกสรร ตั้งแต่ห้องมาตรฐานไปจนถึงห้องแฟมิลี่สุดหรู
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="rooms-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => {
            const roomType = getRoomTypeLabel(room.name || '');
            const isHovered = hoveredRoom === room.id;
            
            // Debug: log room data
            // console.log('Room:', room.name, 'Amenities:', room.amenities);
            
            return (
              <div
                key={room.id}
                className="room-card group bg-resort-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-resort-cream">
                  <img
                    src={getRoomImage(room)}
                    alt={room.name_th}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/images/room-standard.jpg';
                    }}
                  />
                  {/* Room type label */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-resort-text text-xs font-medium rounded-full">
                      {roomType}
                    </span>
                  </div>
                  
                  {/* Hover overlay with Book button */}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <Button
                      onClick={() => handleBookRoom(room)}
                      className="bg-resort-primary text-white hover:bg-resort-primary-hover px-6 py-2 rounded-full font-medium transition-all duration-300"
                      disabled={room.status !== 'available'}
                    >
                      จองเลย
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-resort-text mb-3">
                    {room.name}
                  </h3>

                  {/* Amenities Tags - Dynamic from database */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 ? (
                      // Convert and dedupe amenities, then display up to 5
                      [...new Set(room.amenities.map((a: string) => mapAmenityId(a)))]
                        .slice(0, 5)
                        .map((amenityId: string) => {
                          const config = AMENITY_CONFIG[amenityId];
                          if (!config) return null;
                          const Icon = config.icon;
                          return (
                            <span key={amenityId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-resort-cream text-resort-text-secondary text-xs rounded-full">
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </span>
                          );
                        })
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-resort-cream text-resort-text-secondary text-xs rounded-full">
                          <Wifi className="w-3 h-3" />
                          Wifi
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-resort-cream text-resort-text-secondary text-xs rounded-full">
                          <Tv className="w-3 h-3" />
                          TV
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-resort-cream text-resort-text-secondary text-xs rounded-full">
                          <Wind className="w-3 h-3" />
                          AC
                        </span>
                      </>
                    )}
                  </div>

                  {/* Price and Capacity */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xl font-bold text-resort-accent">
                        ฿{room.price?.toLocaleString()}
                      </span>
                      <span className="text-sm text-resort-text-secondary">/คืน</span>
                    </div>
                    <div className="flex items-center gap-1 text-resort-text-secondary text-sm">
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
                  src={getRoomImage(selectedRoom)}
                  alt={selectedRoom.name_th}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                  onError={(e) => {
                    e.currentTarget.src = '/images/room-standard.jpg';
                  }}
                />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-resort-accent">
                    ฿{selectedRoom.price?.toLocaleString()}
                    <span className="text-lg text-resort-text-secondary">/คืน</span>
                  </span>
                </div>
                <p className="text-resort-text-secondary mb-6">{selectedRoom.description_th}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-resort-cream rounded-xl">
                    <Users className="w-6 h-6 mb-2 text-resort-accent" />
                    <span className="text-sm text-resort-text-secondary">{selectedRoom.capacity} ท่าน</span>
                  </div>
                  <div className="p-4 bg-resort-cream rounded-xl">
                    <span className="text-sm text-resort-text-secondary">{selectedRoom.size} ตร.ม.</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-resort-text">สิ่งอำนวยความสะดวก</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRoom.amenities?.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-resort-primary" />
                        <span className="text-sm text-resort-text-secondary">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setDetailOpen(false);
                    navigate(`/booking?room=${selectedRoom.id}`);
                  }}
                  className="w-full bg-resort-primary hover:bg-resort-primary-hover text-white py-3 rounded-lg font-medium transition-all duration-300"
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

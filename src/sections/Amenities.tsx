import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion';
import SectionShell from '@/components/SectionShell';
import {
  Wifi,
  Car,
  Wind,
  Droplets,
  Tv,
  Refrigerator,
  Coffee,
  Waves,
  UtensilsCrossed,
  Sparkles,
  Sofa,
  Flower2,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const amenities = [
  { icon: Wifi, nameTh: 'Wi-Fi ฟรี', name: 'Free Wi-Fi', description: 'อินเทอร์เน็ตความเร็วสูงทั่วบริเวณ' },
  { icon: Car, nameTh: 'ที่จอดรถ', name: 'Parking', description: 'ที่จอดรถสะดวกสบาย ปลอดภัย' },
  { icon: Wind, nameTh: 'แอร์', name: 'Air Conditioning', description: 'เครื่องปรับอากาศในทุกห้อง' },
  { icon: Droplets, nameTh: 'น้ำอุ่น', name: 'Hot Water', description: 'เครื่องทำน้ำอุ่นตลอด 24 ชั่วโมง' },
  { icon: Tv, nameTh: 'ทีวี', name: 'TV', description: 'ทีวีจอแบนพร้อมช่องเคเบิล' },
  { icon: Refrigerator, nameTh: 'ตู้เย็น', name: 'Refrigerator', description: 'ตู้เย็นและมินิบาร์ในห้อง' },
  { icon: Coffee, nameTh: 'อาหารเช้า', name: 'Breakfast', description: 'อาหารเช้าไทยและนานาชาติ' },
  { icon: Waves, nameTh: 'สระว่ายน้ำ', name: 'Swimming Pool', description: 'สระว่ายน้ำส่วนกลาง' },
  { icon: UtensilsCrossed, nameTh: 'ห้องอาหาร', name: 'Restaurant', description: 'บริการอาหารและเครื่องดื่ม' },
  { icon: Sparkles, nameTh: 'รูมเซอร์วิส', name: 'Room Service', description: 'บริการทำความสะอาดรายวัน' },
  { icon: Sofa, nameTh: 'ล็อบบี้', name: 'Lobby', description: 'พื้นที่พักผ่อนส่วนกลาง' },
  { icon: Flower2, nameTh: 'สวน', name: 'Garden', description: 'สวนสวยสำหรับพักผ่อน' },
];

export default function Amenities() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.amenities-header',
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
        '.amenity-item',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.amenities-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="amenities"
      ref={sectionRef}
      className="overflow-hidden bg-yada-sand py-20 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="amenities-header mb-16">
          <SectionShell
            centered
            label="สิ่งอำนวยความสะดวก"
            title="ทุกความสะดวกสบายเพื่อคุณ"
            subtitle="เราจัดเตรียมสิ่งอำนวยความสะดวกครบครันเพื่อให้การเข้าพักของคุณสมบูรณ์แบบ"
          />
        </div>

        {/* Amenities Grid */}
        <div className="amenities-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <div
                key={index}
                className="amenity-item group cursor-pointer rounded-2xl border border-transparent bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-yada-accent/20 hover:shadow-yada"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yada-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-yada-primary">
                  <Icon className="h-8 w-8 text-yada-primary transition-colors duration-300 group-hover:text-white" />
                </div>
                <h3 className="mb-1 font-semibold text-yada-text">
                  {amenity.nameTh}
                </h3>
                <p className="mb-2 text-xs text-yada-text-secondary">{amenity.name}</p>
                <p className="text-sm text-yada-text-secondary">{amenity.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

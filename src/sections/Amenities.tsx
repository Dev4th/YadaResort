import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
      className="py-20 lg:py-32 bg-resort-cream overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="amenities-header text-center mb-16">
          <span className="section-label">สิ่งอำนวยความสะดวก</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-resort-text mb-4 font-serif">
            ทุกความสะดวกสบายเพื่อคุณ
          </h2>
          <p className="text-resort-text-secondary max-w-2xl mx-auto">
            เราจัดเตรียมสิ่งอำนวยความสะดวกครบครันเพื่อให้การเข้าพักของคุณสมบูรณ์แบบ
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="amenities-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <div
                key={index}
                className="amenity-item group bg-resort-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-resort-primary/10 flex items-center justify-center group-hover:bg-resort-primary transition-colors duration-300">
                  <Icon className="w-8 h-8 text-resort-primary group-hover:text-white transition-colors duration-300 group-hover:rotate-12 transform" />
                </div>
                <h3 className="font-semibold text-resort-text mb-1">
                  {amenity.nameTh}
                </h3>
                <p className="text-xs text-resort-text-secondary mb-2">{amenity.name}</p>
                <p className="text-sm text-resort-text-secondary">{amenity.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

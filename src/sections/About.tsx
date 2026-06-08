import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Heart, Home, Leaf, Users } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/motion';
import { useRoomStore } from '@/stores/store';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Home, text: 'ห้องพักสะดวกสบาย ตกแต่งอย่างสวยงาม' },
  { icon: Leaf, text: 'บรรยากาศเงียบสงบ เป็นส่วนตัว' },
  { icon: Heart, text: 'ใกล้ชิดธรรมชาติและแหล่งท่องเที่ยว' },
  { icon: Users, text: 'บริการด้วยใจจากเจ้าของที่พัก' },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Fetch real data from stores (rooms only - bookings require auth)
  const { rooms, fetchRooms } = useRoomStore();
  const [stats, setStats] = useState({ rooms: 0, customers: 500, rating: 4.8 });

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      rooms: rooms.length || 12,
    }));
  }, [rooms]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // Image reveal animation
      gsap.fromTo(
        imageRef.current,
        { clipPath: 'inset(100% 0 0 0)', scale: 1.1 },
        {
          clipPath: 'inset(0% 0 0 0)',
          scale: 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Content animations
      gsap.fromTo(
        '.about-label',
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.about-title',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.about-text',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.about-feature',
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.about-features',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Parallax effect
      gsap.to(imageRef.current, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="overflow-hidden bg-yada-sand py-20 lg:py-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div ref={imageRef} className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/about.jpg"
                alt="Yada Homestay Experience"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 rounded-xl bg-white p-6 shadow-xl">
              <div className="text-center">
                <span className="text-4xl font-bold text-yada-primary">5+</span>
                <p className="mt-1 text-sm text-yada-text-secondary">ปีประสบการณ์</p>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 -z-10 h-24 w-24 rounded-xl border-2 border-yada-accent" />
          </div>

          {/* Content */}
          <div ref={contentRef}>
            <span className="about-label section-label">เกี่ยวกับเรา</span>
            <h2 className="about-title font-display mb-6 text-3xl font-bold text-yada-text lg:text-4xl">
              Yada Homestay | ญาดาโฮมสเตย์
            </h2>
            <p className="about-text mb-8 leading-relaxed text-yada-text-secondary">
              ที่พักสไตล์โฮมสเตย์ในเพชรบุรีที่ผสมผสานความสะดวกสบายของที่พักสมัยใหม่เข้ากับเสน่ห์ของธรรมชาติ
              เรามุ่งมั่นที่จะให้บริการที่อบอุ่นและเป็นกันเอง
              เพื่อให้ทุกการเข้าพักของคุณเป็นประสบการณ์ที่น่าจดจำ
            </p>

            {/* Features */}
            <div className="about-features space-y-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="about-feature flex items-center gap-4 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yada-primary/10 transition-colors duration-300 group-hover:bg-yada-primary">
                    <Check className="h-5 w-5 text-yada-primary transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <span className="text-yada-text transition-transform duration-200 group-hover:translate-x-1">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 border-t border-yada-accent/20 pt-8">
              <div className="text-center">
                <span className="text-3xl font-bold text-yada-primary">{stats.rooms}</span>
                <p className="mt-1 text-sm text-yada-text-secondary">ห้องพัก</p>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-yada-primary">{stats.customers}+</span>
                <p className="mt-1 text-sm text-yada-text-secondary">ลูกค้าพึงพอใจ</p>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-yada-primary">{stats.rating}</span>
                <p className="mt-1 text-sm text-yada-text-secondary">คะแนนรีวิว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Heart, Home, Leaf, Users } from 'lucide-react';

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

  useEffect(() => {
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
      className="py-20 lg:py-32 bg-[#f5f5f5] overflow-hidden"
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
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-[#c9a962]">5+</span>
                <p className="text-sm text-[#666] mt-1">ปีประสบการณ์</p>
              </div>
            </div>
            {/* Gold accent */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-[#c9a962] rounded-xl -z-10" />
          </div>

          {/* Content */}
          <div ref={contentRef}>
            <span className="about-label section-label">เกี่ยวกับเรา</span>
            <h2 className="about-title text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-6 font-serif">
              Yada Homestay | ญาดาโฮมสเตย์
            </h2>
            <p className="about-text text-[#666] leading-relaxed mb-8">
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
                  <div className="w-10 h-10 rounded-full bg-[#c9a962]/10 flex items-center justify-center group-hover:bg-[#c9a962] transition-colors duration-300">
                    <Check className="w-5 h-5 text-[#c9a962] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-[#1a1a1a] group-hover:translate-x-1 transition-transform duration-200">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#e0e0e0]">
              <div className="text-center">
                <span className="text-3xl font-bold text-[#c9a962]">12</span>
                <p className="text-sm text-[#666] mt-1">ห้องพัก</p>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-[#c9a962]">500+</span>
                <p className="text-sm text-[#666] mt-1">ลูกค้าพึงพอใจ</p>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-[#c9a962]">4.8</span>
                <p className="text-sm text-[#666] mt-1">คะแนนรีวิว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

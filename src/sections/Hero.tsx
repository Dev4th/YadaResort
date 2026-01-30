import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronDown, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background Ken Burns effect
      gsap.fromTo(
        bgRef.current,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: 'expo.out' }
      );

      // Content animations
      const tl = gsap.timeline({ delay: 0.5 });

      tl.fromTo(
        '.hero-line1',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }
      )
        .fromTo(
          '.hero-line2',
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' },
          '-=0.5'
        )
        .fromTo(
          '.hero-subtitle',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(
          '.hero-buttons',
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
          '-=0.2'
        )
        .fromTo(
          '.hero-trust',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(
          '.hero-scroll',
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.1'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0 }}
      >
        <img
          src="/images/hero-bg.jpg"
          alt="Yada Homestay"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Accent Lines */}
      <div className="absolute top-20 left-10 w-32 h-px bg-gradient-to-r from-resort-accent to-transparent animate-pulse-slow" />
      <div className="absolute bottom-40 left-20 w-20 h-px bg-gradient-to-r from-resort-accent to-transparent animate-pulse-slow" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-2xl">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif leading-tight">
            <span className="hero-line1 block overflow-hidden">
              <span className="inline-block">สัมผัสความสงบ</span>
            </span>
            <span className="hero-line2 block overflow-hidden">
              <span className="inline-block text-resort-accent">
                ท่ามกลางธรรมชาติ
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Yada Homestay | ญาดาโฮมสเตย์ - ที่พักสไตล์โฮมสเตย์ในเพชรบุรี
            ที่ผสมผสานความสะดวกสบายและเสน่ห์ของธรรมชาติ
          </p>

          {/* Location Badge */}
          <div className="hero-subtitle flex items-center gap-2 text-white/80 mb-8">
            <MapPin className="w-5 h-5 text-resort-accent" />
            <span>80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000</span>
          </div>

          {/* CTA Buttons */}
          <div className="hero-buttons flex flex-wrap gap-4 mb-10">
            <Button
              onClick={() => scrollToSection('#rooms')}
              className="bg-resort-primary text-white hover:bg-resort-primary-hover text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              จองห้องพัก
            </Button>
            <Button
              onClick={() => scrollToSection('#rooms')}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-resort-text text-lg px-8 py-4 bg-transparent rounded-lg font-medium transition-all duration-300"
            >
              ดูห้องพัก
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="hero-trust flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-resort-accent text-resort-accent"
                  />
                ))}
              </div>
              <span className="text-white font-semibold">4.8/5</span>
              <span className="text-white/70">(128 รีวิว)</span>
            </div>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-resort-accent/20 text-resort-accent rounded-full text-sm">
                ที่พักยอดนิยม
              </span>
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                ราคาดีที่สุด
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => scrollToSection('#about')}
          className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-sm">เลื่อนลง</span>
          <ChevronDown className="w-6 h-6 animate-bounce-gentle" />
        </button>
      </div>
    </section>
  );
}

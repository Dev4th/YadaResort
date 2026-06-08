import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { saveBookingDraft } from '@/lib/bookingDraft';
import { Calendar, ChevronDown, Star, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    if (prefersReducedMotion()) {
      if (bgRef.current) bgRef.current.style.opacity = '1';
      return;
    }
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

  const handleQuickBooking = () => {
    saveBookingDraft({ checkIn, checkOut, adults: guests });
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('adults', guests);
    navigate(`/booking${params.toString() ? `?${params.toString()}` : ''}`);
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
        <div className="absolute inset-0 bg-gradient-to-r from-yada-dark/80 via-yada-dark/50 to-transparent" />
        <div className="grain-overlay absolute inset-0" />
      </div>

      {/* Accent Lines */}
      <div className="absolute top-20 left-10 w-32 h-px bg-gradient-to-r from-yada-accent to-transparent animate-pulse-slow" />
      <div className="absolute bottom-40 left-20 w-20 h-px bg-gradient-to-r from-yada-accent to-transparent animate-pulse-slow" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-2xl">
          {/* Headline */}
          <h1 className="font-display mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            <span className="hero-line1 block overflow-hidden">
              <span className="inline-block">สัมผัสความสงบ</span>
            </span>
            <span className="hero-line2 block overflow-hidden">
              <span className="inline-block text-yada-primary-light">
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
            <MapPin className="w-5 h-5 text-yada-accent" />
            <span>80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000</span>
          </div>

          {/* CTA Buttons */}
          <div className="hero-buttons flex flex-wrap gap-4 mb-10">
            <Button variant="yada" onClick={handleQuickBooking} className="px-8 py-4 text-lg shadow-lg">
              จองห้องพัก
            </Button>
            <Button variant="yada-outline" asChild className="border-2 border-white bg-transparent px-8 py-4 text-lg text-white hover:bg-white hover:text-yada-text">
              <Link to="/rooms">ดูห้องพัก</Link>
            </Button>
          </div>

          <div className="hero-buttons mb-10 grid max-w-4xl gap-3 rounded-lg border border-white/20 bg-white/95 p-3 shadow-2xl backdrop-blur md:grid-cols-[1fr_1fr_0.8fr_auto]">
            <label className="flex min-w-0 items-center gap-3 rounded-md bg-yada-sand px-4 py-3">
              <Calendar className="h-5 w-5 flex-shrink-0 text-yada-primary" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-yada-text-secondary">เช็กอิน</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(event) => setCheckIn(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-yada-text outline-none"
                  aria-label="วันเช็กอิน"
                />
              </span>
            </label>
            <label className="flex min-w-0 items-center gap-3 rounded-md bg-yada-sand px-4 py-3">
              <Calendar className="h-5 w-5 flex-shrink-0 text-yada-primary" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-yada-text-secondary">เช็กเอาท์</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-yada-text outline-none"
                  aria-label="วันเช็กเอาท์"
                />
              </span>
            </label>
            <label className="flex min-w-0 items-center gap-3 rounded-md bg-yada-sand px-4 py-3">
              <Users className="h-5 w-5 flex-shrink-0 text-yada-primary" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-yada-text-secondary">ผู้เข้าพัก</span>
                <select
                  value={guests}
                  onChange={(event) => setGuests(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-yada-text outline-none"
                  aria-label="จำนวนผู้เข้าพัก"
                >
                  <option value="1">1 ท่าน</option>
                  <option value="2">2 ท่าน</option>
                  <option value="3">3 ท่าน</option>
                  <option value="4">4 ท่าน</option>
                  <option value="5">5+ ท่าน</option>
                </select>
              </span>
            </label>
            <Button
              onClick={handleQuickBooking}
              variant="yada"
              className="h-full min-h-14 px-6"
            >
              เช็กห้องว่าง
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="hero-trust flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yada-accent text-yada-accent"
                  />
                ))}
              </div>
              <span className="text-white font-semibold">4.8/5</span>
              <span className="text-white/70">(128 รีวิว)</span>
            </div>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-yada-accent/20 text-yada-accent rounded-full text-sm">
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

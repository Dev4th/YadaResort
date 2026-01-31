import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Facebook, Instagram, MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

gsap.registerPlugin(ScrollTrigger);

const quickLinks = [
  { name: 'หน้าแรก', href: '#hero' },
  { name: 'ห้องพัก', href: '#rooms' },
  { name: 'สิ่งอำนวยความสะดวก', href: '#amenities' },
  { name: 'แกลเลอรี่', href: '#gallery' },
  { name: 'ติดต่อเรา', href: '#contact' },
];

const supportLinks = [
  { name: 'นโยบายการจอง', href: '/terms' },
  { name: 'ข้อกำหนดและเงื่อนไข', href: '/terms' },
  { name: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
  { name: 'ตรวจสอบการจอง', href: '/check-booking' },
];

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-divider',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.footer-content > div',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.footer-content',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer ref={footerRef} className="bg-resort-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Accent Divider */}
        <div className="footer-divider h-px bg-gradient-to-r from-transparent via-resort-accent to-transparent mb-16 origin-left" />

        {/* Main Content */}
        <div className="footer-content grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold font-serif mb-2">
              Yada Homestay
            </h3>
            <p className="text-resort-accent text-sm mb-4">| ญาดาโฮมสเตย์</p>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              สัมผัสความสงบท่ามกลางธรรมชาติ
              ที่พักสไตล์โฮมสเตย์ในเพชรบุรีที่ผสมผสานความสะดวกสบายและเสน่ห์ของธรรมชาติ
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-resort-accent transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-resort-accent transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-resort-accent transition-colors duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6">ลิงก์ด่วน</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-white/70 hover:text-resort-accent hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-6">ช่วยเหลือ</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-resort-accent hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-6">รับข่าวสารและโปรโมชั่น</h4>
            <p className="text-white/70 text-sm mb-4">
              สมัครรับข่าวสารเพื่อรับสิทธิพิเศษและโปรโมชั่นล่าสุด
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  type="email"
                  placeholder="อีเมลของคุณ"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <Button className="bg-resort-accent hover:bg-resort-accent-hover px-4 transition-colors duration-300">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © 2024 Yada Homestay. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="/admin"
                className="text-white/50 hover:text-resort-accent text-sm transition-colors"
              >
                พนักงานเข้าสู่ระบบ
              </a>
              <span className="text-white/30">|</span>
              <span className="text-white/50 text-sm">
                จัดทำด้วยความใส่ใจ
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

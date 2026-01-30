import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useSettingsStore } from '@/stores/supabaseStore';

// Static nearby attractions
const nearbyAttractions = [
  {
    name: 'หาดเจ้าสำราญ',
    distance: '15 นาที',
    type: 'beach'
  },
  {
    name: 'สวนสัตว์เปิดเขาเขียว',
    distance: '30 นาที',
    type: 'zoo'
  },
  {
    name: 'ตลาดน้ำหัวหิน',
    distance: '20 นาที',
    type: 'market'
  },
  {
    name: 'อุทยานแห่งชาติแก่งกระจาน',
    distance: '45 นาที',
    type: 'nature'
  }
];

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettingsStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-header',
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
        '.contact-info',
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.contact-content',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.contact-map',
        { x: 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.contact-content',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.attraction-item',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.attractions-list',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Use settings from store with fallbacks
  const contactInfo = [
    {
      icon: MapPin,
      title: 'ที่อยู่',
      content: settings.address || '80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000',
    },
    {
      icon: Phone,
      title: 'โทรศัพท์',
      content: settings.phone || '081-234-5678',
      href: `tel:${settings.phone || '081-234-5678'}`,
    },
    {
      icon: Mail,
      title: 'อีเมล',
      content: settings.email || 'info@yadahomestay.com',
      href: `mailto:${settings.email || 'info@yadahomestay.com'}`,
    },
    {
      icon: Clock,
      title: 'เวลาทำการ',
      content: '8:00 - 20:00 น. (ทุกวัน)',
    },
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 lg:py-32 bg-resort-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="contact-header text-center mb-16">
          <span className="section-label">ที่ตั้ง</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-resort-text mb-4 font-serif">
            มาเยือน Yada Homestay
          </h2>
          <p className="text-resort-text-secondary max-w-2xl mx-auto">
            ตั้งอยู่ในจังหวัดเพชรบุรี ใกล้แหล่งท่องเที่ยวและธรรมชาติ
          </p>
        </div>

        <div className="contact-content grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="contact-info">
            <div className="bg-resort-cream rounded-2xl p-8">
              <h3 className="text-xl font-bold text-resort-text mb-6 font-serif">
                ข้อมูลติดต่อ
              </h3>

              <div className="space-y-6">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-resort-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-resort-primary transition-colors duration-300">
                        <Icon className="w-5 h-5 text-resort-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <p className="text-sm text-resort-text-secondary mb-1">{item.title}</p>
                        <p className="text-resort-text font-medium">{item.content}</p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <a
                      key={index}
                      href={item.href}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={index}>{content}</div>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-resort-text-secondary mb-4">ติดตามเรา</p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-resort-white shadow-md flex items-center justify-center hover:bg-resort-primary hover:text-white transition-colors duration-300"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-resort-white shadow-md flex items-center justify-center hover:bg-resort-primary hover:text-white transition-colors duration-300"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-resort-white shadow-md flex items-center justify-center hover:bg-resort-primary hover:text-white transition-colors duration-300"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Nearby Attractions */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-resort-text mb-4 font-serif">
                แหล่งท่องเที่ยวใกล้เคียง
              </h3>
              <div className="attractions-list grid grid-cols-2 gap-3">
                {nearbyAttractions.map((attraction, index) => (
                  <div
                    key={index}
                    className="attraction-item bg-resort-cream rounded-xl p-4 hover:bg-resort-primary/10 transition-colors duration-300"
                  >
                    <p className="font-medium text-resort-text text-sm">
                      {attraction.name}
                    </p>
                    <p className="text-xs text-resort-accent mt-1">
                      {attraction.distance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="contact-map">
            <div className="bg-resort-cream rounded-2xl overflow-hidden shadow-lg">
              <div className="aspect-video relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d288.06327731890286!2d99.92220940496846!3d13.128675584188482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30fd272d77c7a4e7%3A0x10c8085764cd1183!2z4LiN4Liy4LiU4Liy4LmC4Liu4Lih4Liq4LmA4LiV4Lii4LmMIHlhZGEgaG9tZSBzdGF5!5e1!3m2!1sth!2sth!4v1769802005809!5m2!1sth!2sth"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Yada Homestay Location"
                  className="absolute inset-0"
                />
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-resort-text mb-2">
                  การเดินทาง
                </h4>
                <p className="text-sm text-resort-text-secondary">
                  จากกรุงเทพฯ ใช้เวลาเดินทางประมาณ 2 ชั่วโมง
                  ผ่านทางถนนเพชรเกษม (ทางหลวงหมายเลข 4)
                  เลี้ยวซ้ายที่แยกธงชัย เข้ามาประมาณ 2 กิโลเมตร
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

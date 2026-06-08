import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/store';

const quickLinks = [
  { name: 'หน้าแรก', href: '/' },
  { name: 'ห้องพัก', href: '/rooms' },
  { name: 'จองห้องพัก', href: '/booking' },
  { name: 'ติดต่อเรา', href: '/#contact' },
];

const supportLinks = [
  { name: 'นโยบายการจอง', href: '/terms' },
  { name: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
  { name: 'ตรวจสอบการจอง', href: '/check-booking' },
];

export default function SiteFooter() {
  const { settings } = useSettingsStore();

  return (
    <footer className="bg-yada-dark pt-16 pb-8 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 h-px bg-gradient-to-r from-transparent via-yada-accent to-transparent" />

        <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-display mb-2 text-2xl font-bold">Yada Homestay</h3>
            <p className="mb-4 text-sm text-yada-accent">| ญาดาโฮมสเตย์</p>
            <p className="mb-6 text-sm leading-relaxed text-white/70">
              โฮมสเตย์เพชรบุรี บรรยากาศอบอุ่น จองตรงกับที่พักได้ง่าย
            </p>
            <div className="flex gap-3">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-yada-accent transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-yada-accent transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.lineUrl && (
                <a href={settings.lineUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-yada-accent transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-6 font-semibold">ลิงก์ด่วน</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-white/70 transition hover:text-yada-accent">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-semibold">ช่วยเหลือ</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-white/70 transition hover:text-yada-accent">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-semibold">พร้อมจองแล้ว?</h4>
            <p className="mb-4 text-sm text-white/70">เลือกห้องและส่งคำขอจองออนไลน์ได้ทันที</p>
            <div className="flex flex-col gap-2">
              <Button variant="yada" asChild>
                <Link to="/booking">จองห้องพัก</Link>
              </Button>
              {settings.lineUrl && (
                <Button variant="yada-outline" className="border-white/30 text-white hover:bg-white hover:text-yada-text" asChild>
                  <a href={settings.lineUrl} target="_blank" rel="noopener noreferrer">แชท LINE</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/50">© {new Date().getFullYear()} Yada Homestay. All rights reserved.</p>
          <Link to="/admin" className="text-sm text-white/50 hover:text-yada-accent">พนักงานเข้าสู่ระบบ</Link>
        </div>
      </div>
    </footer>
  );
}

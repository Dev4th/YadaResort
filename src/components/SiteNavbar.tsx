import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/store';

const sectionLinks = [
  { name: 'หน้าแรก', href: '/#hero', section: '#hero' },
  { name: 'ห้องพัก', href: '/rooms', section: null },
  { name: 'สิ่งอำนวยความสะดวก', href: '/#amenities', section: '#amenities' },
  { name: 'แกลเลอรี่', href: '/#gallery', section: '#gallery' },
  { name: 'ติดต่อเรา', href: '/#contact', section: '#contact' },
];

export default function SiteNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, loadSettings } = useSettingsStore();
  const isHome = location.pathname === '/';
  const solid = !isHome || isScrolled;

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNav = (link: (typeof sectionLinks)[0]) => {
    setIsMobileMenuOpen(false);
    if (link.section && location.pathname === '/') {
      const el = document.querySelector(link.section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(link.href);
  };

  const phone = settings.phone || '081-234-5678';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid ? 'glass-effect shadow-yada py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className={`font-display text-2xl font-bold transition-colors ${solid ? 'text-yada-text' : 'text-white'}`}>
              Yada Homestay
            </span>
            <span className={`text-sm transition-colors ${solid ? 'text-yada-accent' : 'text-white/80'}`}>
              | ญาดาโฮมสเตย์
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {sectionLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => handleNav(link)}
                className={`accent-underline text-sm font-medium transition-colors ${
                  solid ? 'text-yada-text hover:text-yada-primary' : 'text-white hover:text-yada-accent'
                } ${location.pathname === link.href ? 'text-yada-primary' : ''}`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:${phone.replace(/-/g, '')}`}
              className={`flex items-center gap-2 text-sm font-medium ${solid ? 'text-yada-text' : 'text-white'}`}
            >
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </a>
            <Button variant="yada-outline" size="sm" asChild className={!solid ? 'border-white text-white hover:bg-white hover:text-yada-text' : ''}>
              <Link to="/check-booking">ตรวจสอบการจอง</Link>
            </Button>
            <Button variant="yada" size="sm" asChild>
              <Link to="/booking">จองเลย</Link>
            </Button>
          </div>

          <button type="button" className="p-2 lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="เมนู">
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${solid ? 'text-yada-text' : 'text-white'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${solid ? 'text-yada-text' : 'text-white'}`} />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mt-4 rounded-xl bg-yada-surface px-4 py-4 shadow-yada lg:hidden">
            <div className="flex flex-col gap-3 pt-2">
              {sectionLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNav(link)}
                  className="text-left text-base font-medium text-yada-text hover:text-yada-primary"
                >
                  {link.name}
                </button>
              ))}
              <Link to="/check-booking" className="text-base font-medium text-yada-text-secondary" onClick={() => setIsMobileMenuOpen(false)}>
                ตรวจสอบการจอง
              </Link>
              <Button variant="yada" className="mt-2 w-full" asChild>
                <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)}>จองเลย</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

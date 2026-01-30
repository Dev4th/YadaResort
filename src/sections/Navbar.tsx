import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { name: 'หน้าแรก', href: '#hero' },
  { name: 'ห้องพัก', href: '#rooms' },
  { name: 'สิ่งอำนวยความสะดวก', href: '#amenities' },
  { name: 'แกลเลอรี่', href: '#gallery' },
  { name: 'ติดต่อเรา', href: '#contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isScrolled
          ? 'glass-effect shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
      style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-2 group"
          >
            <span
              className={`text-2xl font-bold font-serif transition-colors duration-300 ${
                isScrolled ? 'text-resort-text' : 'text-white'
              }`}
            >
              Yada Homestay
            </span>
            <span
              className={`text-sm transition-colors duration-300 ${
                isScrolled ? 'text-resort-accent' : 'text-white/80'
              }`}
            >
              | ญาดาโฮมสเตย์
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`accent-underline text-sm font-medium transition-colors duration-200 ${
                  isScrolled
                    ? 'text-resort-text hover:text-resort-primary'
                    : 'text-white hover:text-resort-accent'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:081-234-5678"
              className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                isScrolled ? 'text-resort-text' : 'text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>081-234-5678</span>
            </a>
            <Button
              onClick={() => scrollToSection('#rooms')}
              className="bg-resort-primary text-white hover:bg-resort-primary-hover px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md"
            >
              จองเลย
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X
                className={`w-6 h-6 ${
                  isScrolled ? 'text-resort-text' : 'text-white'
                }`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${
                  isScrolled ? 'text-resort-text' : 'text-white'
                }`}
              />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 bg-resort-cream rounded-xl px-4 shadow-lg">
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-base font-medium text-resort-text hover:text-resort-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Button
                onClick={() => scrollToSection('#rooms')}
                className="bg-resort-primary text-white hover:bg-resort-primary-hover w-full mt-2 py-3 rounded-lg font-medium transition-all duration-300"
              >
                จองเลย
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/motion';
import SectionShell from '@/components/SectionShell';

const categoryLabels: Record<string, string> = {
  pool: 'สระว่ายน้ำ',
  rooms: 'ห้องพัก',
  garden: 'สวน',
  common: 'พื้นที่ส่วนกลาง',
  dining: 'อาหาร',
  exterior: 'ภายนอก',
};

// Static gallery images
const galleryImages = [
  {
    id: 'g1',
    src: '/images/gallery-pool.jpg',
    alt: 'สระว่ายน้ำ',
    category: 'pool',
    size: 'large'
  },
  {
    id: 'g2',
    src: '/images/gallery-room.jpg',
    alt: 'ห้องพัก',
    category: 'rooms',
    size: 'medium'
  },
  {
    id: 'g3',
    src: '/images/gallery-garden.jpg',
    alt: 'สวน',
    category: 'garden',
    size: 'small'
  },
  {
    id: 'g4',
    src: '/images/gallery-lobby.jpg',
    alt: 'ล็อบบี้',
    category: 'common',
    size: 'medium'
  },
  {
    id: 'g5',
    src: '/images/gallery-breakfast.jpg',
    alt: 'อาหารเช้า',
    category: 'dining',
    size: 'small'
  },
  {
    id: 'g6',
    src: '/images/gallery-exterior.jpg',
    alt: 'ภายนอก',
    category: 'exterior',
    size: 'large'
  }
];

gsap.registerPlugin(ScrollTrigger);

export default function Gallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gallery-header',
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
        '.gallery-item',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeLightbox();
  }, [lightboxOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (lightboxOpen) closeBtnRef.current?.focus();
  }, [lightboxOpen]);

  const getGridClass = (size: string) => {
    switch (size) {
      case 'large':
        return 'md:col-span-2 md:row-span-2';
      case 'medium':
        return 'md:col-span-1 md:row-span-2';
      default:
        return 'md:col-span-1 md:row-span-1';
    }
  };

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="overflow-hidden bg-yada-surface py-20 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="gallery-header mb-16">
          <SectionShell
            centered
            label="แกลเลอรี่"
            title="บรรยากาศ Yada Homestay"
            subtitle="ชมภาพบรรยากาศและความสวยงามของที่พักเรา"
          />
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className={`gallery-item relative overflow-hidden rounded-xl cursor-pointer group ${getGridClass(image.size)}`}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Enhanced hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-400 backdrop-blur-[1px] group-hover:backdrop-blur-0">
                {/* Camera icon top-right */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                {/* Category badge bottom-left */}
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 translate-y-2 group-hover:translate-y-0">
                  <span className="px-2.5 py-1 bg-yada-accent/90 text-white text-xs font-medium rounded-full">
                    {categoryLabels[image.category] || image.alt}
                  </span>
                </div>
                {/* Alt label center */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-white font-semibold text-base drop-shadow-md">{image.alt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="แกลเลอรี่ภาพขยาย"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
        >
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="ปิดแกลเลอรี่"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:text-white"
            onClick={closeLightbox}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-sm font-medium">
            {currentImageIndex + 1} / {galleryImages.length}
          </div>

          {/* Navigation */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[80vh] px-20"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={currentImageIndex}
              src={galleryImages[currentImageIndex].src}
              alt={galleryImages[currentImageIndex].alt}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl animate-scale-in"
            />
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="px-3 py-1 bg-yada-accent/80 text-white text-xs font-medium rounded-full">
                {categoryLabels[galleryImages[currentImageIndex].category] || galleryImages[currentImageIndex].alt}
              </span>
              <p className="text-white/80 text-sm">
                {galleryImages[currentImageIndex].alt}
              </p>
            </div>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 items-center">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-yada-accent w-8 h-2.5'
                    : 'bg-white/40 hover:bg-white/70 w-2.5 h-2.5'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

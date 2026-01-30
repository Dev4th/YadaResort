import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
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
      className="py-20 lg:py-32 bg-resort-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="gallery-header text-center mb-16">
          <span className="section-label">แกลเลอรี่</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-resort-text mb-4 font-serif">
            บรรยากาศ Yada Homestay
          </h2>
          <p className="text-resort-text-secondary max-w-2xl mx-auto">
            ชมภาพบรรยากาศและความสวยงามของที่พักเรา
          </p>
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
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                  {image.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation */}
          <button
            className="absolute left-4 text-white/80 hover:text-white p-2"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            className="absolute right-4 text-white/80 hover:text-white p-2"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[80vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[currentImageIndex].src}
              alt={galleryImages[currentImageIndex].alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-4 text-lg">
              {galleryImages[currentImageIndex].alt}
            </p>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-resort-accent w-6'
                    : 'bg-white/50 hover:bg-white/80'
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

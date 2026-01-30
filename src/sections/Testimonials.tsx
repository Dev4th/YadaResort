import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Static testimonials data
const testimonials = [
  {
    id: 't1',
    name: 'คุณสมศรี',
    location: 'กรุงเทพฯ',
    rating: 5,
    comment: 'บรรยากาศดีมาก เงียบสงบ เหมาะกับการพักผ่อน พนักงานบริการดี เป็นกันเอง',
    date: new Date('2024-01-15')
  },
  {
    id: 't2',
    name: 'คุณประเวช',
    location: 'ชลบุรี',
    rating: 5,
    comment: 'ห้องพักสะอาด สะดวกสบาย วิวสวย อาหารเช้าอร่อย ประทับใจมากครับ',
    date: new Date('2024-01-10')
  },
  {
    id: 't3',
    name: 'คุณนภา',
    location: 'เชียงใหม่',
    rating: 5,
    comment: 'ประทับใจมาก จะกลับมาพักอีกแน่นอน แนะนำเลยค่ะ คุ้มค่ากับราคา',
    date: new Date('2024-01-05')
  },
  {
    id: 't4',
    name: 'คุณมานะ',
    location: 'กรุงเทพฯ',
    rating: 4,
    comment: 'ที่พักสวย บรรยากาศดี ราคาเหมาะสม ใกล้แหล่งท่องเที่ยวหลายที่',
    date: new Date('2023-12-28')
  }
];

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.testimonials-header',
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
        '.testimonial-card',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.testimonials-container',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-20 lg:py-32 bg-resort-cream overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="testimonials-header text-center mb-16">
          <span className="section-label">รีวิวจากลูกค้า</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-resort-text mb-4 font-serif">
            เสียงจากผู้เข้าพัก
          </h2>
          <p className="text-resort-text-secondary max-w-2xl mx-auto">
            อ่านประสบการณ์จริงจากผู้เข้าพักของเรา
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="testimonials-container relative max-w-4xl mx-auto">
          {/* Quote Icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <Quote className="w-16 h-16 text-resort-primary/20" />
          </div>

          {/* Main Card */}
          <div className="testimonial-card bg-resort-white rounded-3xl shadow-xl p-8 md:p-12 text-center relative">
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < currentTestimonial.rating
                      ? 'fill-resort-accent text-resort-accent'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-xl md:text-2xl text-resort-text leading-relaxed mb-8 font-light italic">
              "{currentTestimonial.comment}"
            </p>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-resort-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-resort-primary">
                  {currentTestimonial.name.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-resort-text">
                  {currentTestimonial.name}
                </p>
                <p className="text-sm text-resort-text-secondary">{currentTestimonial.location}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-resort-white shadow-md flex items-center justify-center hover:bg-resort-primary hover:text-white transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-resort-primary w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-resort-white shadow-md flex items-center justify-center hover:bg-resort-primary hover:text-white transition-colors duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

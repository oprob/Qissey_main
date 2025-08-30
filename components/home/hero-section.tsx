'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const heroSlides = [
  {
    id: 1,
    title: 'Haute Couture',
    subtitle: 'Designer Collection',
    description: 'Exquisite designer pieces crafted for the modern woman who values sophistication.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop',
    cta: 'Shop Designer',
    href: '/collections/dresses',
    textColor: 'text-white',
  },
  {
    id: 2,
    title: 'Effortless Elegance',
    subtitle: 'Evening Collection',
    description: 'From cocktail parties to red carpet events, find your perfect statement piece.',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&h=800&fit=crop',
    cta: 'Explore Evening Wear',
    href: '/collections/evening-wear',
    textColor: 'text-white',
  },
  {
    id: 3,
    title: 'Contemporary Chic',
    subtitle: 'Modern Essentials',
    description: 'Sophisticated pieces that seamlessly transition from day to night.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=800&fit=crop',
    cta: 'Shop Now',
    href: '/collections/tops-blouses',
    textColor: 'text-white',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true
  });
  const router = useRouter();

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  // Scroll tracking for logo animation and mobile detection
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial setup
    handleResize();
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!emblaApi) return;

    const autoScroll = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoScroll);
  }, [emblaApi]);

  // Calculate logo animation progress
  const maxScroll = isMobile ? 300 : 400;
  const logoProgress = Math.min(scrollY / maxScroll, 1);
  
  // Logo movement calculations
  const startY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400; // Center of hero
  const endY = 32; // Navbar height center (64px / 2)
  const startX = typeof window !== 'undefined' ? window.innerWidth / 2 : 600;
  const endX = isMobile ? 100 : 150; // Navbar logo position
  
  // Calculate current position
  const currentY = startY - (startY - endY) * logoProgress;
  const currentX = startX - (startX - endX) * logoProgress;
  
  // Scale from large to navbar size
  const startScale = isMobile ? 1 : 1.2;
  const endScale = isMobile ? 0.4 : 0.5;
  const currentScale = startScale - (startScale - endScale) * logoProgress;
  
  // Show fixed logo during transition
  const showFixedLogo = scrollY > 50 && scrollY < maxScroll;
  const hideHeroLogo = scrollY > 50; // Hide hero logo as soon as moving animation starts

  return (
    <section className="relative h-screen overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container h-screen">
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className="embla__slide relative">
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              
              <div className="relative h-full flex items-center justify-center">
                <div className="container mx-auto px-4 text-center">
                  {/* Centered Qissey Logo */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: hideHeroLogo ? 0 : 1, 
                      scale: hideHeroLogo ? 0.8 : 1 
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative z-20"
                  >
                    <button
                      onClick={() => router.push('/collections/dresses')}
                      className="group focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg p-4"
                    >
                      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif font-bold text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        Qissey
                      </h1>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="mt-4 text-lg sm:text-xl text-white/90 font-light tracking-wide"
                      >
                        Designer Women's Fashion
                      </motion.div>
                    </button>
                  </motion.div>
                  
                  {/* Scroll Hint */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-20"
                    style={{ opacity: scrollY > 50 ? 0 : 1 - scrollY / 50 }}
                  >
                    <div className="text-white text-xs sm:text-sm font-medium flex flex-col items-center space-y-2 sm:space-y-3">
                      <span className="tracking-wide uppercase">Discover Fashion</span>
                      <div className="w-px h-8 sm:h-12 bg-white/60 animate-pulse" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fixed Moving Logo */}
      {showFixedLogo && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: currentX,
            top: currentY,
            transform: `translate(-50%, -50%) scale(${currentScale})`,
            transition: 'none'
          }}
        >
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif font-bold drop-shadow-2xl whitespace-nowrap"
            style={{
              color: logoProgress > 0.7 ? '#000000' : '#ffffff', // Change to black as it approaches navbar
              transition: 'color 0.3s ease-in-out'
            }}
          >
            Qissey
          </h1>
        </div>
      )}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              onClick={() => {
                setCurrentSlide(index);
                emblaApi?.scrollTo(index);
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="text-white text-sm opacity-70">
          <div className="flex items-center space-x-2">
            <span>Scroll to explore</span>
            <div className="w-px h-8 bg-white/50 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
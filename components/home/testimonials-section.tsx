'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Isabella Chen',
    location: 'New York',
    rating: 5,
    comment: 'Qissey has completely transformed my wardrobe. The quality is unmatched, and every dress makes me feel confident and elegant. I receive compliments wherever I go!',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=80&h=80&fit=crop&crop=face',
    product: 'Silk Evening Gown',
  },
  {
    id: 2,
    name: 'Sophia Williams',
    location: 'London',
    rating: 5,
    comment: 'As a busy executive, I need clothes that work hard for me. Qissey\'s blazer dresses are my go-to - sophisticated, comfortable, and versatile for any occasion.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    product: 'Designer Blazer Dress',
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    location: 'Los Angeles',
    rating: 5,
    comment: 'The attention to detail is extraordinary. From the luxurious fabrics to the perfect fit, every piece feels like it was made just for me. Qissey understands women\'s fashion.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    product: 'Cashmere Wrap Coat',
  },
  {
    id: 4,
    name: 'Olivia Thompson',
    location: 'Paris',
    rating: 5,
    comment: 'I\'ve never felt more beautiful than when wearing Qissey. The designs are timeless yet contemporary, and the quality is investment-worthy. My closet is now curated exclusively with their pieces.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    product: 'Printed Midi Dress',
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Customer Reviews
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Real stories from women who love their custom-fitted designer clothing.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-neutral-200 rounded-2xl p-8 md:p-12 text-center"
          >
            <Quote className="h-8 w-8 text-neutral-300 mx-auto mb-6" />
            
            <div className="flex justify-center mb-6">
              {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>

            <blockquote className="text-lg md:text-xl text-neutral-700 mb-8 leading-relaxed">
              "{testimonials[currentIndex].comment}"
            </blockquote>

            <div className="flex items-center justify-center space-x-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-black">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-sm text-neutral-600">
                  {testimonials[currentIndex].location}
                </p>
                <p className="text-sm text-neutral-500">
                  Purchased: {testimonials[currentIndex].product}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white shadow-lg border-neutral-200 hover:bg-neutral-50"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white shadow-lg border-neutral-200 hover:bg-neutral-50"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-black scale-125' : 'bg-neutral-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-neutral-200"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-2">25K+</div>
            <div className="text-sm text-neutral-600">Women Empowered</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-2">4.9</div>
            <div className="text-sm text-neutral-600">Average Rating</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-2">98%</div>
            <div className="text-sm text-neutral-600">Return Customers</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-2">Global</div>
            <div className="text-sm text-neutral-600">Shipping Available</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
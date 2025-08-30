'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';

const promoMessages = [
  {
    icon: Sparkles,
    title: "Early Access",
    description: "Get exclusive preview of our upcoming collection",
    cta: "Get Access",
    href: "/collections/early-access",
    accent: "Limited Time"
  },
  {
    icon: Ruler,
    title: "Custom Fit",
    description: "Experience perfect fitting clothes with our custom sizing",
    cta: "Try Custom Fit",
    href: "/collections/men",
    accent: "New Feature"
  }
];

export function PromoBanner() {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % promoMessages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const message = promoMessages[currentMessage];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-black text-white py-4 relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-neutral-900 opacity-50 animate-pulse" />
      
      <div className="container mx-auto px-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center text-center"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <message.icon className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">{message.title}</span>
              </div>
              
              <div className="hidden sm:block w-px h-4 bg-white/30" />
              
              <p className="text-sm">
                {message.description}
              </p>
              
              <div className="hidden sm:block w-px h-4 bg-white/30" />
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">{message.accent}</span>
              </div>
            </div>
            
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="ml-6 bg-white text-black hover:bg-neutral-100 transition-all duration-200"
            >
              <Link href={message.href}>
                {message.cta}
              </Link>
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <motion.div
          className="h-full bg-yellow-400"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          key={currentMessage}
          transition={{ duration: 6, ease: "linear" }}
        />
      </div>
    </motion.section>
  );
}
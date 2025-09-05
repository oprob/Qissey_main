'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/hooks/use-cart-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'Dresses', href: '/collections/dresses' },
  { name: 'Tops & Blouses', href: '/collections/tops-blouses' },
  { name: 'Bottoms', href: '/collections/bottoms' },
  { name: 'Outerwear', href: '/collections/outerwear' },
  { name: 'Evening Wear', href: '/collections/evening-wear' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, isOpen: isCartOpen, openCart } = useCartStore();
  const { user, isLoading } = useAuthStore();
  
  // Check if we're on the home page
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      // For home page: show navbar when scrolled past hero section
      // For other pages: show navbar immediately with slight scroll
      if (isHomePage) {
        setIsScrolled(currentScrollY > window.innerHeight * 0.8);
      } else {
        setIsScrolled(currentScrollY > 10);
      }
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

  // Calculate logo visibility and animation
  const maxScroll = isMobile ? 300 : 400;
  const logoProgress = Math.min(scrollY / maxScroll, 1);
  const showNavbarLogo = scrollY >= maxScroll; // Show only after transition completes

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-500 ease-out',
        // Home page: transparent when not scrolled, white background when scrolled
        // Other pages: always white background
        isHomePage 
          ? (isScrolled 
              ? 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm border-b border-neutral-200' 
              : 'bg-transparent')
          : 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm border-b border-neutral-200'
      )}
    >
      <div className="container mx-auto px-4">
        <div className={cn(
          'flex items-center justify-between transition-all duration-500',
          isScrolled ? 'h-16' : 'h-20'
        )}>
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'md:hidden transition-colors duration-300',
              isHomePage 
                ? (isScrolled ? 'text-black hover:text-neutral-700' : 'text-white hover:text-neutral-300')
                : 'text-black hover:text-neutral-700'
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div 
              className={cn(
                'font-serif font-bold transition-all duration-500',
                isHomePage 
                  ? (showNavbarLogo ? 'opacity-100' : 'opacity-0')
                  : 'opacity-100',
                isHomePage 
                  ? (isScrolled ? 'text-2xl text-black' : 'text-3xl text-white drop-shadow-lg')
                  : 'text-2xl text-black'
              )}
            >
              QISSEY
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-300 uppercase tracking-wide',
                  isHomePage 
                    ? (isScrolled 
                        ? 'text-neutral-700 hover:text-black' 
                        : 'text-white/90 hover:text-white drop-shadow-sm')
                    : 'text-neutral-700 hover:text-black'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn(
                'hidden sm:flex transition-colors duration-300',
                isHomePage 
                  ? (isScrolled 
                      ? 'text-neutral-700 hover:text-black' 
                      : 'text-white/90 hover:text-white')
                  : 'text-neutral-700 hover:text-black'
              )}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                asChild 
                className={cn(
                  'transition-colors duration-300',
                  isHomePage 
                    ? (isScrolled 
                        ? 'text-neutral-700 hover:text-black' 
                        : 'text-white/90 hover:text-white')
                    : 'text-neutral-700 hover:text-black'
                )}
              >
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Account */}
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className={cn(
                'transition-colors duration-300',
                isHomePage 
                  ? (isScrolled 
                      ? 'text-neutral-700 hover:text-black' 
                      : 'text-white/90 hover:text-white')
                  : 'text-neutral-700 hover:text-black'
              )}
            >
              <Link href={user ? "/account" : "/auth/login"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative transition-colors duration-300',
                isHomePage 
                  ? (isScrolled 
                      ? 'text-neutral-700 hover:text-black' 
                      : 'text-white/90 hover:text-white')
                  : 'text-neutral-700 hover:text-black'
              )}
              onClick={openCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className={cn(
                  'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white transition-colors duration-300',
                  isHomePage 
                    ? (isScrolled ? 'bg-black' : 'bg-white/20 backdrop-blur-sm')
                    : 'bg-black'
                )}>
                  {totalItems}
                </span>
              )}
            </Button>
            
            {/* Menu text */}
            <div className={cn(
              'hidden md:block text-sm font-medium uppercase tracking-widest transition-all duration-300 ml-4',
              isHomePage 
                ? (isScrolled 
                    ? 'text-neutral-700' 
                    : 'text-white/90')
                : 'text-neutral-700'
            )}>
              MENU
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t"
            >
              <form onSubmit={handleSearch} className="py-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t bg-white"
          >
            <nav className="container mx-auto px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-lg font-medium text-neutral-700 hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="pt-4 border-t">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
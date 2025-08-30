'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid3X3, LayoutGrid, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/collection/product-filters';
import { cn } from '@/utils/cn';

// Mock product type for demo purposes
interface MockProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  images: string[];
  variants: { size: string; color: string; stock: number; }[];
}

interface CollectionPageContentProps {
  collection: {
    name: string;
    description: string;
    image: string;
  };
  slug: string;
  searchParams: {
    sort?: string;
    price_min?: string;
    price_max?: string;
    size?: string;
  };
}

// Mock products data - replace with actual data fetching
const mockProducts: MockProduct[] = [
  {
    id: '1',
    name: 'Classic Cotton Shirt',
    slug: 'classic-cotton-shirt',
    price: 89.99,
    sale_price: null,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop'],
    variants: [{ size: 'M', color: 'White', stock: 10 }]
  },
  {
    id: '2', 
    name: 'Elegant Blazer',
    slug: 'elegant-blazer',
    price: 199.99,
    sale_price: 149.99,
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop'],
    variants: [{ size: 'L', color: 'Navy', stock: 5 }]
  },
  {
    id: '3',
    name: 'Designer Handbag',
    slug: 'designer-handbag', 
    price: 299.99,
    sale_price: null,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop'],
    variants: [{ size: 'One Size', color: 'Black', stock: 3 }]
  },
  {
    id: '4',
    name: 'Premium Jeans',
    slug: 'premium-jeans',
    price: 129.99,
    sale_price: null,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop'],
    variants: [{ size: '32', color: 'Dark Blue', stock: 8 }]
  },
  {
    id: '5',
    name: 'Silk Scarf',
    slug: 'silk-scarf',
    price: 79.99,
    sale_price: 59.99,
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=600&fit=crop'],
    variants: [{ size: 'One Size', color: 'Multi', stock: 15 }]
  },
  {
    id: '6',
    name: 'Leather Shoes',
    slug: 'leather-shoes',
    price: 249.99,
    sale_price: null,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop'],
    variants: [{ size: '42', color: 'Brown', stock: 6 }]
  }
];

export function CollectionPageContent({ collection, slug, searchParams }: CollectionPageContentProps) {
  const [products] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [sortBy, setSortBy] = useState(searchParams.sort || 'featured');

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...products];

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, sortBy, searchParams]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6">
                {collection.name}
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                {collection.description}
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-px h-12 bg-white/60 animate-pulse" />
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Header with filters and sorting */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'large' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('large')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">
                {filteredProducts.length} products
              </span>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="featured">Featured</option>
                <option value="name">Name A-Z</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hidden lg:block overflow-hidden"
                >
                  <div className="sticky top-24">
                    <ProductFilters onFiltersChange={() => {}} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <div className="flex-1">
              <motion.div
                layout
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                )}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard 
                      product={product as any}
                      className={viewMode === 'large' ? 'large' : ''}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" className="px-8">
                  Load More Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto h-full">
              <ProductFilters onFiltersChange={() => {}} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
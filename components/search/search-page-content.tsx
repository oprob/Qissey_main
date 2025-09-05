'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid3X3, LayoutGrid, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/collection/product-filters';
import { cn } from '@/utils/cn';

// Mock product data
const mockProducts = [
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
];

interface SearchPageContentProps {
  searchParams: {
    q?: string;
    sort?: string;
    price_min?: string;
    price_max?: string;
    size?: string;
  };
}

export function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '');
  const [products] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [sortBy, setSortBy] = useState(searchParams.sort || 'featured');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Filter products based on search query
    let filtered = [...products];

    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
  }, [products, searchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set('q', searchQuery.trim());
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="bg-neutral-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                Search Our Collection
              </h1>
              <p className="text-neutral-600 mb-8">
                Discover premium fashion pieces that match your style
              </p>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 h-12 text-lg"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  disabled={isLoading}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>

              {/* Search Results Info */}
              {searchParams.q && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6"
                >
                  <p className="text-neutral-600">
                    {filteredProducts.length > 0 ? (
                      <>Showing {filteredProducts.length} results for <strong>"{searchParams.q}"</strong></>
                    ) : (
                      <>No results found for <strong>"{searchParams.q}"</strong></>
                    )}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {searchParams.q && (
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
                {filteredProducts.length > 0 ? (
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
                ) : searchParams.q ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="max-w-md mx-auto">
                      <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
                      <p className="text-neutral-600 mb-6">
                        Try adjusting your search terms or browse our collections to find what you're looking for.
                      </p>
                      <Button onClick={() => router.push('/collections/new-arrivals')}>
                        Browse Collections
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}

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
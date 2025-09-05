'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { getFeaturedProducts, ProductWithDetails } from '@/lib/products';
import { ProductGridSkeleton } from '@/components/ui/skeletons';

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getFeaturedProducts(8);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21V9l11-4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Featured Products Yet</h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          We're currently curating our collection. Check back soon for beautiful designer pieces!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showQuickAdd={true}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/products/new">
            Add Products
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
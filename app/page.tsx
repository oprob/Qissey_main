import { Suspense } from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedCollections } from '@/components/home/featured-collections';
import { FeaturedProducts } from '@/components/home/featured-products';
import { PromoBanner } from '@/components/home/promo-banner';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { USPSection } from '@/components/home/usp-section';
import { ProductGridSkeleton } from '@/components/ui/skeletons';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Early Access Banner */}
      <PromoBanner />

      {/* USP Section - Featured prominently */}
      <USPSection />

      {/* Featured Collections */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Collections
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Sophisticated designs crafted for the modern woman.
            </p>
          </div>
          <FeaturedCollections />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Products
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Designer pieces available in custom sizes.
            </p>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
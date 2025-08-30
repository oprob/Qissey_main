import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CollectionPageContent } from '@/components/collection/collection-page-content';
import { ProductGridSkeleton } from '@/components/ui/skeletons';

interface CollectionPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    sort?: string;
    price_min?: string;
    price_max?: string;
    size?: string;
  };
}

// Map of collection slugs to their display data
const collections = {
  'new-arrivals': {
    name: 'New Arrivals',
    description: 'Discover our latest pieces that define contemporary elegance.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop'
  },
  'men': {
    name: 'Men\'s Collection',
    description: 'Sophisticated pieces crafted for the modern gentleman.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop'
  },
  'women': {
    name: 'Women\'s Collection', 
    description: 'Elegant designs that celebrate feminine sophistication.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616c96c9a57?w=1200&h=600&fit=crop'
  },
  'accessories': {
    name: 'Accessories',
    description: 'Perfect finishing touches for your refined style.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=600&fit=crop'
  },
  'sale': {
    name: 'Sale',
    description: 'Exceptional pieces at exceptional prices.',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=600&fit=crop'
  },
  'premium': {
    name: 'Premium Collection',
    description: 'Our finest pieces showcasing exceptional craftsmanship.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=600&fit=crop'
  },
  'early-access': {
    name: 'Early Access',
    description: 'Be the first to discover our upcoming collection.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop'
  }
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = collections[params.slug as keyof typeof collections];
  
  if (!collection) {
    return {
      title: 'Collection Not Found - Qissey',
    };
  }

  return {
    title: `${collection.name} - Qissey`,
    description: collection.description,
  };
}

export default function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const collection = collections[params.slug as keyof typeof collections];
  
  if (!collection) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-16">
      <Suspense fallback={<ProductGridSkeleton />}>
        <CollectionPageContent 
          collection={collection}
          slug={params.slug}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}
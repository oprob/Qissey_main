'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Collection } from '@/types';
import { CollectionCardSkeleton } from '@/components/ui/skeletons';

const fallbackCollections = [
  {
    id: '1',
    name: 'Evening Elegance',
    slug: 'evening-wear',
    description: 'Sophisticated gowns and cocktail dresses for special occasions.',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=400&fit=crop',
    is_featured: true,
    sort_order: 1,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    name: 'Signature Dresses',
    slug: 'dresses',
    description: 'Timeless dresses that embody feminine grace and modern sophistication.',
    image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop',
    is_featured: true,
    sort_order: 2,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    name: 'Designer Outerwear',
    slug: 'outerwear',
    description: 'Luxurious coats and jackets that make a statement.',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop',
    is_featured: true,
    sort_order: 3,
    created_at: '',
    updated_at: '',
  },
];

export function FeaturedCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('is_featured', true)
          .order('sort_order');

        if (error) throw error;

        // Use fallback data if no collections found
        setCollections(data && data.length > 0 ? data : fallbackCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections(fallbackCollections);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 md:h-72 lg:h-80 w-full bg-neutral-200 animate-pulse rounded-2xl shadow-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {collections.map((collection, index) => (
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
          className="group relative"
        >
          <Link href={`/collections/${collection.slug}`} className="block">
            <div className="relative h-56 md:h-72 lg:h-80 w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-lg">
              <Image
                src={collection.image_url || fallbackCollections[index % fallbackCollections.length].image_url}
                alt={collection.name}
                fill
                className="object-cover transition-all duration-1000 group-hover:scale-110"
                sizes="100vw"
              />
              
              {/* Gradient Overlays for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Decorative elements */}
              <div className="absolute top-6 left-6 w-16 h-px bg-white/60 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200" />
              <div className="absolute bottom-6 right-6 w-16 h-px bg-white/60 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-300" />
              
              {/* Center Title with enhanced styling */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center transform transition-all duration-500 group-hover:-translate-y-2">
                  <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">
                    <div className="w-12 h-px bg-white/80 mx-auto mb-4" />
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-white tracking-wide transition-all duration-500 group-hover:text-shadow-lg group-hover:tracking-wider">
                    {collection.name}
                  </h3>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">
                    <div className="w-12 h-px bg-white/80 mx-auto mt-4" />
                  </div>
                </div>
              </div>
              
              {/* Subtle corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-400" />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-500" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-600" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-700" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
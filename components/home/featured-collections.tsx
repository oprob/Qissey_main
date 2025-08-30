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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <CollectionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection, index) => (
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group"
        >
          <Link href={`/collections/${collection.slug}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 mb-4">
              <Image
                src={collection.image_url || fallbackCollections[index % fallbackCollections.length].image_url}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-serif font-semibold mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-sm opacity-90 mb-4">
                    {collection.description}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-black hover:bg-neutral-100 group-hover:bg-white group-hover:text-black"
                  >
                    Explore Collection
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
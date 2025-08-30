'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { ProductGridSkeleton } from '@/components/ui/skeletons';

// Fallback product data for women's designer clothing
const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Silk Evening Gown',
    slug: 'silk-evening-gown',
    description: 'An exquisite floor-length gown crafted from pure silk with delicate beadwork.',
    short_description: 'Pure silk, hand-beaded details',
    price: 15999,
    compare_at_price: 18999,
    cost_price: null,
    sku: 'SEG001',
    barcode: null,
    status: 'active',
    inventory_quantity: 12,
    weight: null,
    requires_shipping: true,
    is_featured: true,
    meta_title: null,
    meta_description: null,
    created_at: '',
    updated_at: '',
    product_images: [
      {
        id: '1',
        product_id: '1',
        url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
        alt_text: 'Silk Evening Gown',
        sort_order: 0,
        created_at: '',
      },
    ],
    product_variants: [
      {
        id: '1',
        product_id: '1',
        title: 'Medium',
        option1: 'M',
        option2: 'Midnight Blue',
        option3: null,
        sku: 'SEG001-M-MB',
        price: null,
        compare_at_price: null,
        inventory_quantity: 4,
        weight: null,
        created_at: '',
        updated_at: '',
      },
    ],
  },
  {
    id: '2',
    name: 'Designer Blazer Dress',
    slug: 'designer-blazer-dress',
    description: 'A sophisticated blazer dress that seamlessly transitions from office to evening.',
    short_description: 'Tailored fit, versatile styling',
    price: 8999,
    compare_at_price: null,
    cost_price: null,
    sku: 'DBD001',
    barcode: null,
    status: 'active',
    inventory_quantity: 24,
    weight: null,
    requires_shipping: true,
    is_featured: true,
    meta_title: null,
    meta_description: null,
    created_at: '',
    updated_at: '',
    product_images: [
      {
        id: '2',
        product_id: '2',
        url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
        alt_text: 'Designer Blazer Dress',
        sort_order: 0,
        created_at: '',
      },
    ],
    product_variants: [
      {
        id: '2',
        product_id: '2',
        title: 'Small',
        option1: 'S',
        option2: 'Black',
        option3: null,
        sku: 'DBD001-S-BK',
        price: null,
        compare_at_price: null,
        inventory_quantity: 8,
        weight: null,
        created_at: '',
        updated_at: '',
      },
    ],
  },
  {
    id: '3',
    name: 'Cashmere Wrap Coat',
    slug: 'cashmere-wrap-coat',
    description: 'Luxurious cashmere coat with an elegant wrap silhouette and belt detail.',
    short_description: '100% cashmere, wrap style',
    price: 24999,
    compare_at_price: null,
    cost_price: null,
    sku: 'CWC001',
    barcode: null,
    status: 'active',
    inventory_quantity: 8,
    weight: null,
    requires_shipping: true,
    is_featured: true,
    meta_title: null,
    meta_description: null,
    created_at: '',
    updated_at: '',
    product_images: [
      {
        id: '3',
        product_id: '3',
        url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop',
        alt_text: 'Cashmere Wrap Coat',
        sort_order: 0,
        created_at: '',
      },
    ],
    product_variants: [
      {
        id: '3',
        product_id: '3',
        title: 'Medium',
        option1: 'M',
        option2: 'Camel',
        option3: null,
        sku: 'CWC001-M-CA',
        price: null,
        compare_at_price: null,
        inventory_quantity: 3,
        weight: null,
        created_at: '',
        updated_at: '',
      },
    ],
  },
  {
    id: '4',
    name: 'Printed Midi Dress',
    slug: 'printed-midi-dress',
    description: 'Feminine midi dress featuring an exclusive floral print and flattering A-line silhouette.',
    short_description: 'Exclusive print, A-line cut',
    price: 6999,
    compare_at_price: 8999,
    cost_price: null,
    sku: 'PMD001',
    barcode: null,
    status: 'active',
    inventory_quantity: 18,
    weight: null,
    requires_shipping: true,
    is_featured: true,
    meta_title: null,
    meta_description: null,
    created_at: '',
    updated_at: '',
    product_images: [
      {
        id: '4',
        product_id: '4',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
        alt_text: 'Printed Midi Dress',
        sort_order: 0,
        created_at: '',
      },
    ],
    product_variants: [
      {
        id: '4',
        product_id: '4',
        title: 'Large',
        option1: 'L',
        option2: 'Floral Print',
        option3: null,
        sku: 'PMD001-L-FP',
        price: null,
        compare_at_price: null,
        inventory_quantity: 6,
        weight: null,
        created_at: '',
        updated_at: '',
      },
    ],
  },
];

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (*),
            product_variants (*)
          `)
          .eq('is_featured', true)
          .eq('status', 'active')
          .limit(8);

        if (error) throw error;

        // Use fallback data if no products found
        setProducts(data && data.length > 0 ? data : fallbackProducts);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return <ProductGridSkeleton />;
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
          <Link href="/collections/dresses">
            View All Dresses
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
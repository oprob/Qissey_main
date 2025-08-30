import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProductPageContent } from '@/components/product/product-page-content';
import { ProductPageSkeleton } from '@/components/ui/skeletons';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Mock product data - replace with actual data fetching
const mockProduct = {
  id: '1',
  name: 'Classic Cotton Shirt',
  slug: 'classic-cotton-shirt',
  price: 89.99,
  sale_price: null,
  description: 'Crafted from premium cotton, this classic shirt embodies timeless elegance. Perfect for both casual and formal occasions, it features a tailored fit and premium finishing touches.',
  details: [
    '100% Premium Cotton',
    'Tailored Fit',
    'Machine Washable',
    'Premium Button Closure',
    'Available in Multiple Colors'
  ],
  images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=1200&fit=crop'
  ],
  variants: [
    { id: '1', size: 'S', color: 'White', stock: 10 },
    { id: '2', size: 'M', color: 'White', stock: 8 },
    { id: '3', size: 'L', color: 'White', stock: 5 },
    { id: '4', size: 'XL', color: 'White', stock: 3 },
    { id: '5', size: 'S', color: 'Blue', stock: 7 },
    { id: '6', size: 'M', color: 'Blue', stock: 9 },
    { id: '7', size: 'L', color: 'Blue', stock: 4 },
  ],
  category: 'Shirts',
  collection: 'Men\'s Collection'
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // In a real app, you would fetch the product data here
  const product = mockProduct; // await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found - Qissey',
    };
  }

  return {
    title: `${product.name} - Qissey`,
    description: product.description,
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  // In a real app, you would fetch the product data here
  const product = mockProduct; // await getProduct(params.slug);
  
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-16">
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductPageContent product={product} />
      </Suspense>
    </div>
  );
}
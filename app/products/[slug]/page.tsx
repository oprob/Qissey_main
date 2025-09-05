import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProductPageContent } from '@/components/product/product-page-content';
import { ProductPageSkeleton } from '@/components/ui/skeletons';
import { getProductBySlug, ProductWithDetails } from '@/lib/products';

// Adapter function to convert database product to expected interface
function adaptProductForPageContent(product: ProductWithDetails) {
  return {
    id: product.id,
    name: product.name,
    price: product.price, // Price is already in dollars
    sale_price: product.compare_at_price || null,
    description: product.description || '',
    details: [
      product.short_description || '',
      ...(product.sku ? [`SKU: ${product.sku}`] : []),
      ...(product.weight ? [`Weight: ${product.weight}kg`] : [])
    ].filter(Boolean),
    images: product.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map(img => img.url) || [],
    variants: product.product_variants?.map(variant => ({
      id: variant.id,
      size: variant.option1 || 'Standard',
      color: variant.option2 || 'Default',
      stock: variant.inventory_quantity
    })) || [],
    category: 'General', // Default category since we don't have categories yet
    collection: 'Main Collection' // Default collection
  };
}

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found - Qissey',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: `${product.name} - Qissey`,
    description: product.description || product.short_description || `Shop ${product.name} at Qissey`,
    openGraph: {
      title: product.name,
      description: product.description || product.short_description || '',
      images: product.product_images?.length > 0 
        ? [{ url: product.product_images[0].url, alt: product.product_images[0].alt_text || product.name }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }

  // Convert database product to expected format
  const adaptedProduct = adaptProductForPageContent(product);

  return (
    <div className="min-h-screen pt-16">
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductPageContent product={adaptedProduct} />
      </Suspense>
    </div>
  );
}
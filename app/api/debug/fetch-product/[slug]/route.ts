import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/products';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    console.log('Fetching product with slug:', slug);
    
    const product = await getProductBySlug(slug);
    
    if (!product) {
      return NextResponse.json({ 
        error: 'Product not found',
        slug
      }, { status: 404 });
    }

    // Adapter function to convert database product to expected interface (same as product page)
    const adaptedProduct = {
      id: product.id,
      name: product.name,
      price: product.price / 100, // Convert cents to dollars
      sale_price: product.compare_at_price ? product.compare_at_price / 100 : null,
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
      category: 'General',
      collection: 'Main Collection'
    };

    return NextResponse.json({
      success: true,
      rawProduct: product,
      adaptedProduct,
      debug: {
        hasVariants: !!product.product_variants?.length,
        variantCount: product.product_variants?.length || 0,
        productStatus: product.status,
        availableSizes: Array.from(new Set(adaptedProduct.variants.map(v => v.size))),
        availableColors: Array.from(new Set(adaptedProduct.variants.map(v => v.color)))
      }
    });

  } catch (error) {
    console.error('Debug fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
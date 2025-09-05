import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;

    // Get product with variants using admin client
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        product_images (
          id, product_id, url, alt_text, sort_order, created_at
        ),
        product_variants (
          id, product_id, title, option1, option2, option3, sku, 
          price, compare_at_price, inventory_quantity, weight, created_at, updated_at
        )
      `)
      .eq('slug', slug)
      .single();

    if (productError) {
      return NextResponse.json({ 
        error: 'Product fetch error', 
        details: productError,
        slug 
      }, { status: 404 });
    }

    // Also get raw variant data
    const { data: rawVariants, error: variantError } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        has_custom_sizing: product.has_custom_sizing,
        product_images_count: product.product_images?.length || 0,
        product_variants_count: product.product_variants?.length || 0,
        product_images: product.product_images,
        product_variants: product.product_variants
      },
      rawVariants,
      debug: {
        variantError,
        productHasVariants: !!product.product_variants?.length,
        rawVariantCount: rawVariants?.length || 0
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
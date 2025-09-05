import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

export interface ProductWithDetails extends Product {
  product_images: Array<{
    id: string;
    product_id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    created_at: string;
  }>;
  product_variants: Array<{
    id: string;
    product_id: string;
    title: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    sku: string | null;
    price: number | null;
    compare_at_price: number | null;
    inventory_quantity: number;
    weight: number | null;
    created_at: string;
    updated_at: string;
  }>;
}

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts(limit = 8): Promise<ProductWithDetails[]> {
  try {
    const { data, error } = await supabase
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
      .eq('is_featured', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

/**
 * Get all active products with pagination
 */
export async function getProducts(
  page = 1, 
  limit = 12,
  filters?: {
    search?: string;
    priceMin?: number;
    priceMax?: number;
  }
): Promise<{ products: ProductWithDetails[]; hasMore: boolean }> {
  try {
    let query = supabase
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
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    if (filters?.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin);
    }
    
    if (filters?.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return { products: [], hasMore: false };
    }

    const hasMore = count ? (page * limit) < count : false;

    return { 
      products: data || [], 
      hasMore 
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], hasMore: false };
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  try {
    const { data, error } = await supabase
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
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Get related products (similar products)
 */
export async function getRelatedProducts(
  productId: string, 
  limit = 4
): Promise<ProductWithDetails[]> {
  try {
    const { data, error } = await supabase
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
      .eq('status', 'active')
      .neq('id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching related products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

/**
 * Search products
 */
export async function searchProducts(
  query: string, 
  limit = 20
): Promise<ProductWithDetails[]> {
  try {
    const { data, error } = await supabase
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
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}
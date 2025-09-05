import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify the user and get their profile
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Failed to verify user role' }, { status: 500 });
    }

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use admin client for the actual database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { productId, variants } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('API: saveProductVariants called with:', { productId, variants });

    // First, delete existing variants for this product using admin client
    const deleteResult = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('product_id', productId);
    
    if (deleteResult.error) {
      console.error('Error deleting existing variants:', deleteResult.error);
      return NextResponse.json({ error: deleteResult.error.message }, { status: 500 });
    }

    if (!variants || variants.length === 0) {
      return NextResponse.json({ data: [], error: null });
    }

    // Insert new variants with proper data mapping
    const variantsToInsert = variants.map((variant: any) => {
      const mappedVariant = {
        product_id: productId,
        title: variant.title || '',
        option1: variant.option1 || null,
        option2: variant.option2 || null,
        option3: variant.option3 || null,
        sku: variant.sku || null,
        price: variant.price ? Number(variant.price) : null,
        compare_at_price: variant.compare_at_price ? Number(variant.compare_at_price) : null,
        cost_price: variant.cost_price ? Number(variant.cost_price) : null,
        inventory_quantity: variant.inventory_quantity ? Number(variant.inventory_quantity) : 0,
        inventory_policy: variant.inventory_policy || 'deny',
        requires_shipping: variant.requires_shipping !== false,
        weight: variant.weight ? Number(variant.weight) : null,
        size_category: variant.size_category || null,
        measurements: variant.measurements || null,
      };
      console.log('API: Mapped variant:', mappedVariant);
      return mappedVariant;
    });

    console.log('API: Inserting variants:', variantsToInsert);
    
    const result = await supabaseAdmin
      .from('product_variants')
      .insert(variantsToInsert)
      .select();

    console.log('API: Insert result:', result);

    if (result.error) {
      console.error('Error inserting variants:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ data: result.data, error: null });

  } catch (error) {
    console.error('API: saveProductVariants error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save variants' 
    }, { status: 500 });
  }
}
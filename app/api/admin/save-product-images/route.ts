import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Admin user verified:', user.email);

    // Parse request body
    const { productId, images } = await request.json();

    if (!productId || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Missing productId or images array' },
        { status: 400 }
      );
    }

    console.log(`Saving ${images.length} images to database for product ${productId}`);
    
    const imageRecords = images.map((image: any, index: number) => ({
      product_id: productId,
      url: image.url,
      alt_text: image.alt_text,
      sort_order: index
    }));

    console.log('Image records to insert:', imageRecords);

    const { error } = await supabaseAdmin
      .from('product_images')
      .insert(imageRecords);

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { error: `Failed to save image records: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Images saved to database successfully');

    return NextResponse.json({ 
      success: true,
      message: `${images.length} images saved successfully`
    });

  } catch (error) {
    console.error('Unexpected error in save-product-images API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
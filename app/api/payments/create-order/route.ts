import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { razorpay } from '@/lib/razorpay';

// Force Node.js runtime for Razorpay SDK compatibility
export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== Create Order API Called ===');
    console.log('Razorpay Key ID present:', !!process.env.RAZORPAY_KEY_ID);
    console.log('Razorpay Key Secret present:', !!process.env.RAZORPAY_KEY_SECRET);
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);

    let authenticatedUser = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use token from header
      const token = authHeader.split(' ')[1];
      const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Token user:', user?.id);
      console.log('Token error:', error);
      authenticatedUser = user;
    } else {
      // Fallback to cookies
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('Session:', session?.user?.id);
      console.log('User:', user?.id);
      console.log('Session error:', sessionError);
      console.log('User error:', userError);

      authenticatedUser = session?.user || user;
    }
    
    if (!authenticatedUser) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log('Parsing request body...');
    const { cartItems, shippingAddress, billingAddress, totalAmount } = await request.json();
    
    console.log('Request data:', { 
      cartItemsCount: cartItems?.length, 
      hasShippingAddress: !!shippingAddress, 
      totalAmount 
    });

    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log('Validation failed: No cart items');
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    if (!shippingAddress || !totalAmount) {
      console.log('Validation failed: Missing shipping or total');
      return NextResponse.json({ error: 'Shipping address and total amount are required' }, { status: 400 });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('Generated order number:', orderNumber);

    // Create Razorpay order
    console.log('Creating Razorpay order with amount:', Math.round(totalAmount * 100));
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // Convert to paise
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          user_id: authenticatedUser.id,
          order_number: orderNumber
        }
      });
      console.log('Razorpay order created:', razorpayOrder.id);
    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      return NextResponse.json({ error: 'Payment gateway error' }, { status: 500 });
    }

    // Create order in database with pending status
    const orderData = {
      user_id: authenticatedUser.id,
      order_number: orderNumber,
      order_status: 'pending',
      total_price: totalAmount,
      subtotal_price: totalAmount, // Assuming no tax/shipping for now
      shipping_first_name: shippingAddress.firstName,
      shipping_last_name: shippingAddress.lastName,
      shipping_address1: shippingAddress.address1,
      shipping_address2: shippingAddress.address2,
      shipping_city: shippingAddress.city,
      shipping_province: shippingAddress.province,
      shipping_postal_code: shippingAddress.postalCode,
      shipping_country: shippingAddress.country,
      shipping_phone: shippingAddress.phone,
      email: shippingAddress.email || authenticatedUser.email,
      payment_status: 'pending',
      notes: `Razorpay Order ID: ${razorpayOrder.id}`
    };

    console.log('Inserting order into database...');
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Database order creation error:', orderError);
      return NextResponse.json({ 
        error: 'Failed to create order', 
        details: orderError.message 
      }, { status: 500 });
    }
    
    console.log('Order created in database:', order.id);

    // Create order line items
    const lineItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      variant_title: item.variant_title,
      quantity: item.quantity,
      price: item.price,
      total_price: item.price * item.quantity,
      sku: item.sku
    }));

    console.log('Creating order line items:', lineItems.length);
    const { error: lineItemsError } = await supabaseAdmin
      .from('order_line_items')
      .insert(lineItems);

    if (lineItemsError) {
      console.error('Error creating order line items:', lineItemsError);
      // Don't fail the order creation, but log the error
    } else {
      console.log('Line items created successfully');
    }

    console.log('Returning success response');
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
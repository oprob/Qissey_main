import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';

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
    console.log('=== Payment Verification API Called ===');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
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
      console.log('Token auth user:', user?.id);
      authenticatedUser = user;
    } else {
      // Fallback to cookies
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Cookie auth user:', user?.id);
      authenticatedUser = user;
    }
    
    if (!authenticatedUser) {
      console.log('No authenticated user for verification');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id 
    } = await request.json();
    
    console.log('Payment verification data:', {
      razorpay_order_id,
      razorpay_payment_id,
      order_id,
      signature_present: !!razorpay_signature
    });

    // Verify the payment signature
    console.log('Verifying payment signature...');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    console.log('Signature verification:', {
      expected: expectedSignature.substring(0, 10) + '...',
      received: razorpay_signature.substring(0, 10) + '...',
      matches: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      console.log('Signature verification failed');
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Update order status to paid
    console.log('Updating order status to paid...');
    const { data: order, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'processing',
        notes: `Razorpay Order ID: ${razorpay_order_id}\nPayment ID: ${razorpay_payment_id}\nSignature: ${razorpay_signature}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .eq('user_id', authenticatedUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update order',
        details: updateError.message 
      }, { status: 500 });
    }
    
    console.log('Order updated successfully:', order.id);

    // Get order line items to update inventory
    const { data: lineItems, error: lineItemsError } = await supabaseAdmin
      .from('order_line_items')
      .select('*')
      .eq('order_id', order.id);

    if (lineItems && lineItems.length > 0) {
      console.log('Updating inventory for', lineItems.length, 'items');
      
      // Update inventory for each item
      for (const item of lineItems) {
        if (item.variant_id) {
          console.log(`Reducing inventory for variant ${item.variant_id} by ${item.quantity}`);
          try {
            await supabaseAdmin.rpc('update_inventory', {
              variant_id: item.variant_id,
              quantity_change: -item.quantity
            });
          } catch (invError) {
            console.error('Inventory update error:', invError);
          }
        }
      }
    }

    console.log('Payment verification completed successfully');
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        order_status: order.order_status,
        payment_status: order.payment_status
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      error: 'Payment verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Razorpay configuration...');
    
    // Try to create a simple test order
    const testOrder = await razorpay.orders.create({
      amount: 100, // ₹1.00 in paise
      currency: 'INR',
      receipt: 'test_receipt_123',
      notes: {
        test: 'true'
      }
    });

    console.log('Test order created:', testOrder.id);
    
    return NextResponse.json({
      success: true,
      message: 'Razorpay is working correctly',
      order_id: testOrder.id
    });

  } catch (error) {
    console.error('Razorpay test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
// This file should ONLY be imported in server-side code (API routes)
// It contains secret keys and should never be accessible from client-side

import Razorpay from 'razorpay';

// Server-side environment validation
if (typeof window !== 'undefined') {
  throw new Error('Razorpay library should only be imported in server-side code');
}

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Missing required Razorpay environment variables');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
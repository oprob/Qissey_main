import { Metadata } from 'next';
import { RazorpayCheckout } from '@/components/checkout/razorpay-checkout';

export const metadata: Metadata = {
  title: 'Checkout - Qissey',
  description: 'Complete your purchase securely with our enhanced checkout experience.',
};

export default function CheckoutPage() {
  return <RazorpayCheckout />;
}
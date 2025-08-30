import { Metadata } from 'next';
import { CheckoutPageContent } from '@/components/checkout/checkout-page-content';

export const metadata: Metadata = {
  title: 'Checkout - Rare Rabbit',
  description: 'Complete your purchase securely.',
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
import { Metadata } from 'next';
import { CartPageContent } from '@/components/cart/cart-page-content';

export const metadata: Metadata = {
  title: 'Shopping Cart - Qissey',
  description: 'Review your selected items and proceed to checkout.',
};

export default function CartPage() {
  return <CartPageContent />;
}
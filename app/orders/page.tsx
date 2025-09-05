import { Metadata } from 'next';
import { OrderHistoryContent } from '@/components/orders/order-history-content';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: 'Order History - Qissey',
  description: 'View your order history and track your purchases.',
};

export default function OrderHistoryPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-16">
        <OrderHistoryContent />
      </div>
    </ProtectedRoute>
  );
}
import { Metadata } from 'next';
import { AdminOrdersPage } from '@/components/admin/orders/admin-orders-page';
import { AdminRoute } from '@/components/auth/admin-route';

export const metadata: Metadata = {
  title: 'Manage Orders - Admin | Qissey',
  description: 'Manage customer orders and track fulfillment.',
};

export default function OrdersAdminPage() {
  return (
    <AdminRoute>
      <AdminOrdersPage />
    </AdminRoute>
  );
}
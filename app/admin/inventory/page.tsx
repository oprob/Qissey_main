import { Metadata } from 'next';
import { AdminRoute } from '@/components/auth/admin-route';
import { AdminInventoryPage } from '@/components/admin/inventory/admin-inventory-page';

export const metadata: Metadata = {
  title: 'Inventory Management - Admin | Qissey',
  description: 'Manage product inventory and stock levels.',
};

export default function InventoryAdminPage() {
  return (
    <AdminRoute>
      <AdminInventoryPage />
    </AdminRoute>
  );
}
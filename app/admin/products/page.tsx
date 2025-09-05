import { Metadata } from 'next';
import { AdminProductsPage } from '@/components/admin/products/admin-products-page';
import { AdminRoute } from '@/components/auth/admin-route';

export const metadata: Metadata = {
  title: 'Manage Products - Admin | Qissey',
  description: 'Manage your product catalog with full CRUD operations.',
};

export default function ProductsAdminPage() {
  return (
    <AdminRoute>
      <AdminProductsPage />
    </AdminRoute>
  );
}
import { Metadata } from 'next';
import { AdminRoute } from '@/components/auth/admin-route';
import { ProductForm } from '@/components/admin/products/product-form';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const metadata: Metadata = {
  title: 'Add Product - Admin | Qissey',
  description: 'Add a new product to your catalog.',
};

export default function NewProductPage() {
  return (
    <AdminRoute>
      <ErrorBoundary>
        <ProductForm mode="create" />
      </ErrorBoundary>
    </AdminRoute>
  );
}
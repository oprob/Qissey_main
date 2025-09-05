import { Metadata } from 'next';
import { AdminRoute } from '@/components/auth/admin-route';
import { ProductForm } from '@/components/admin/products/product-form';
import { ProductErrorBoundary } from '@/components/ui/product-error-boundary';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Edit Product - Admin | Qissey',
  description: 'Edit product details.',
};

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <AdminRoute>
      <ProductErrorBoundary>
        <ProductForm mode="edit" productId={params.id} />
      </ProductErrorBoundary>
    </AdminRoute>
  );
}
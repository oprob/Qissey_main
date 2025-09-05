import { Metadata } from 'next';
import { AdminRoute } from '@/components/auth/admin-route';
import { AdminCustomersPage } from '@/components/admin/customers/admin-customers-page';

export const metadata: Metadata = {
  title: 'Manage Customers - Admin | Qissey',
  description: 'View and manage customer accounts.',
};

export default function CustomersAdminPage() {
  return (
    <AdminRoute>
      <AdminCustomersPage />
    </AdminRoute>
  );
}
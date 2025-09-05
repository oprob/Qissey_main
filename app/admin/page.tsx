import { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { AdminRoute } from '@/components/auth/admin-route';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Qissey',
  description: 'Manage your Qissey store with powerful admin tools.',
};

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
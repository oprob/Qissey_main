import { Metadata } from 'next';
import { AccountPageContent } from '@/components/account/account-page-content';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: 'My Account - Qissey',
  description: 'Manage your account, orders, and preferences.',
};

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-16">
        <AccountPageContent />
      </div>
    </ProtectedRoute>
  );
}
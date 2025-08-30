import { Metadata } from 'next';
import { LoginPageContent } from '@/components/auth/login-page-content';

export const metadata: Metadata = {
  title: 'Sign In - Qissey',
  description: 'Sign in to your Qissey account.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-16">
      <LoginPageContent />
    </div>
  );
}
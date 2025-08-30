import { Metadata } from 'next';
import { RegisterPageContent } from '@/components/auth/register-page-content';

export const metadata: Metadata = {
  title: 'Create Account - Qissey',
  description: 'Create your Qissey account and start your style journey.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-16">
      <RegisterPageContent />
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/admin-layout';
import { SimpleAdminLayout } from '@/components/admin/simple-admin-layout';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isInitialized, isLoading } = useAuthStore();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, [user, isInitialized]);

  const checkAdminAccess = async () => {
    if (!isInitialized) {
      return;
    }

    // If no user, redirect to login with return URL
    if (!user) {
      const currentPath = window.location.pathname;
      const searchParams = window.location.search;
      const fullPath = currentPath + searchParams;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(fullPath)}`);
      return;
    }

    try {
      // Check user role from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // If no profile exists, create one with customer role
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            role: 'customer'
          });

        if (!insertError) {
          setUserRole('customer');
        }
      } else {
        setUserRole(profile?.role || 'customer');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setUserRole('customer');
    } finally {
      setIsCheckingRole(false);
    }
  };

  // Show loading while checking auth and role
  if (!isInitialized || isLoading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show loading if redirecting (no user)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check if user has admin access
  if (!['admin', 'super_admin'].includes(userRole || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. Please contact an administrator.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Return to Home
            </button>
            <button
              onClick={() => router.push('/account')}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Go to Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <SimpleAdminLayout>{children}</SimpleAdminLayout>;
}
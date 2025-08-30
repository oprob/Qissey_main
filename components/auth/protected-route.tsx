'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const { user, isInitialized, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is initialized and there's no user
    if (isInitialized && !user && !isLoading) {
      const currentPath = window.location.pathname;
      const searchParams = window.location.search;
      const fullPath = currentPath + searchParams;
      router.push(`${redirectTo}?redirectTo=${encodeURIComponent(fullPath)}`);
    }
  }, [user, isInitialized, isLoading, router, redirectTo]);

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if user is not authenticated (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
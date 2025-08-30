'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useCartStore } from '@/hooks/use-cart-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    const init = async () => {
      await initialize();
      // Fetch cart after auth is initialized
      await fetchCart();
    };

    init();
  }, [initialize, fetchCart]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  return <>{children}</>;
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=callback_error');
          return;
        }

        if (data.session) {
          router.push('/');
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/login?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-neutral-600">Completing authentication...</p>
      </div>
    </div>
  );
}
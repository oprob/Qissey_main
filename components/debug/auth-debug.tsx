'use client';

import { useAuthStore } from '@/hooks/use-auth-store';

export function AuthDebug() {
  const { user, isInitialized, isLoading, profile } = useAuthStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>
        <strong>isInitialized:</strong> {isInitialized ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>isLoading:</strong> {isLoading ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>user:</strong> {user ? 'Logged in' : 'Not logged in'}
      </div>
      <div>
        <strong>email:</strong> {user?.email || 'N/A'}
      </div>
      <div>
        <strong>profile:</strong> {profile ? 'Loaded' : 'Not loaded'}
      </div>
    </div>
  );
}
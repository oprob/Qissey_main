import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Refresh session if expired
  await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // For admin routes, let the client-side AdminRoute component handle the checks
  // This prevents redirect loops and allows for better error handling
  if (pathname.startsWith('/admin')) {
    // Just refresh the session, but don't redirect here
    // The AdminRoute component will handle authentication and role checks
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/wishlist/:path*'
  ],
};
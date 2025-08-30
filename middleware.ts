import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // For now, just pass through all requests
  // Protection is handled client-side via ProtectedRoute component
  return NextResponse.next();
}

export const config = {
  matcher: []
};
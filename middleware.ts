import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Middleware is disabled because we're using localStorage for token storage,
// which is not accessible in server-side middleware. Route protection is handled
// by the ProtectedRoute component on the client side.

// Public routes that don't require authentication
// const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

// Routes that should redirect to dashboard if already authenticated
// const AUTH_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  // Middleware disabled - using client-side ProtectedRoute component instead
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

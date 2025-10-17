'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'DRIVER';
}

/**
 * Protected route component that redirects to login if not authenticated
 * Optionally checks for specific role requirements
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Check role requirement if specified
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to unauthorized page or dashboard
        if (user?.role === 'ADMIN') {
          router.push('/dashboard');
        } else if (user?.role === 'DRIVER') {
          router.push('/driver');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { PageSpinner } from '@/components/ui/Spinner';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

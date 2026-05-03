import { RouterProvider } from 'react-router';
import { useEffect } from 'react';
import { router } from '@/routes';
import { useAuthStore } from '@/stores/authStore';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <RouterProvider router={router} />;
}

import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <Outlet />
    </div>
  );
}

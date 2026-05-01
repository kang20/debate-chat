import { Outlet, Link } from 'react-router';
import { MessageSquare } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-600">
            <MessageSquare size={28} />
            토론챗
          </Link>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

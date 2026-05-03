import { Outlet } from 'react-router';
import { Header } from '@/components/Header';
import { Toaster } from 'react-hot-toast';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
        &copy; 2026 토론챗. All rights reserved.
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}

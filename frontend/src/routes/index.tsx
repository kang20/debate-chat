import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { RoomDetailPage } from '@/pages/room/RoomDetailPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'rooms/:roomId', element: <RoomDetailPage /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },
]);

import { Link, useNavigate } from 'react-router';
import { MessageSquare, Bell, LogOut, Menu, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <MessageSquare size={24} />
          <span className="hidden sm:inline">토론챗</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Button size="sm" onClick={() => navigate('/')} variant="ghost">
                <Plus size={16} />
                새 토론
              </Button>
              <Link to="/notifications" className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100">
                <Avatar name={user?.nickname ?? ''} size="sm" />
                <span className="text-sm font-medium">{user?.nickname}</span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                로그인
              </Button>
              <Button size="sm" onClick={() => navigate('/auth/signup')}>
                회원가입
              </Button>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-gray-600 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Avatar name={user?.nickname ?? ''} size="sm" />
                <span className="font-medium">{user?.nickname}</span>
              </Link>
              <Link
                to="/notifications"
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell size={18} />
                알림
                {unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false); }}>
                로그인
              </Button>
              <Button onClick={() => { navigate('/auth/signup'); setMobileMenuOpen(false); }}>
                회원가입
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

import { Link, useNavigate } from 'react-router';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { OAuthProvider } from '@/types/user';

const oauthAccounts = [
  { code: 'mock-google-kim', provider: 'GOOGLE' as OAuthProvider, nickname: '김토론' },
  { code: 'mock-kakao-lee', provider: 'KAKAO' as OAuthProvider, nickname: '이논리' },
  { code: 'mock-google-park', provider: 'GOOGLE' as OAuthProvider, nickname: '박반박' },
];

export function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleOAuthLogin = async (provider: OAuthProvider, code: string) => {
    try {
      await login({ provider, code });
      toast.success('로그인 성공!');
      navigate('/');
    } catch {
      toast.error('OAuth 인증에 실패했습니다.');
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2 text-indigo-600">
        <MessageSquare size={32} />
        <h1 className="text-2xl font-bold">토론챗</h1>
      </div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">
        다시 오신 것을 환영합니다
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        소셜 계정으로 간편하게 로그인하세요
      </p>
      <div className="space-y-3">
        <Button
          className="w-full justify-center gap-2"
          disabled={isLoading}
          onClick={() => handleOAuthLogin('GOOGLE', 'mock-google-kim')}
        >
          {isLoading ? '로그인 중...' : '구글로 로그인'}
        </Button>
        <Button
          className="w-full justify-center gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          disabled={isLoading}
          onClick={() => handleOAuthLogin('KAKAO', 'mock-kakao-lee')}
        >
          {isLoading ? '로그인 중...' : '카카오로 로그인'}
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        계정이 없으신가요?{' '}
        <Link to="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
          회원가입
        </Link>
      </p>
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-[11px] text-gray-500">
        <p className="font-medium text-gray-600">테스트 계정 (클릭하면 해당 계정으로 로그인)</p>
        <div className="mt-2 space-y-1">
          {oauthAccounts.map((a) => (
            <button
              key={a.code}
              onClick={() => handleOAuthLogin(a.provider, a.code)}
              className="block w-full rounded px-2 py-1 text-left hover:bg-gray-100"
            >
              {a.provider === 'GOOGLE' ? '구글' : '카카오'} — {a.nickname}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

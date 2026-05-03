import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isValidNickname } from '@/utils/validation';
import toast from 'react-hot-toast';
import type { OAuthProvider } from '@/types/user';

export function SignupPage() {
  const [provider, setProvider] = useState<OAuthProvider | null>(null);
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!isValidNickname(nickname)) errs.nickname = '닉네임은 2~20자 한글/영문/숫자만 가능합니다.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) {
      toast.error('소셜 계정을 선택해주세요.');
      return;
    }
    if (!validate()) return;
    try {
      await signup({ provider, code: `mock-${provider.toLowerCase()}-new`, nickname });
      toast.success('회원가입이 완료되었습니다! 로그인해주세요.');
      navigate('/auth/login');
    } catch {
      toast.error('회원가입에 실패했습니다. 이미 사용 중인 닉네임일 수 있습니다.');
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2 text-indigo-600">
        <MessageSquare size={32} />
        <h1 className="text-2xl font-bold">토론챗</h1>
      </div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">회원가입</h2>
      <p className="mb-6 text-sm text-gray-500">
        소셜 계정으로 가입하고 토론에 참여하세요
      </p>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">소셜 계정 선택</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setProvider('GOOGLE')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
              provider === 'GOOGLE'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            구글
          </button>
          <button
            type="button"
            onClick={() => setProvider('KAKAO')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
              provider === 'KAKAO'
                ? 'border-yellow-500 bg-yellow-50/50 text-yellow-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            카카오
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="nickname"
          label="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          error={errors.nickname}
          placeholder="2~20자 한글/영문/숫자"
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading || !provider}>
          {isLoading ? '가입 중...' : '가입하기'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          로그인
        </Link>
      </p>
    </div>
  );
}

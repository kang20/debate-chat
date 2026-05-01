import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('kim@example.com');
  const [password, setPassword] = useState('password123');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success('로그인 성공!');
      navigate('/');
    } catch {
      toast.error('이메일 또는 비밀번호가 올바르�� 않습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-center">로그인</h1>
      <Input
        id="email"
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일을 입력하세요"
        required
      />
      <Input
        id="password"
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호를 입력하세요"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>
      <p className="text-center text-sm text-gray-500">
        계정이 없으신가요?{' '}
        <Link to="/auth/signup" className="text-indigo-600 hover:underline">
          회원가��
        </Link>
      </p>
      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
        <p className="font-medium mb-1">테스트 계정:</p>
        <p>kim@example.com / password123</p>
        <p>lee@example.com / password123</p>
      </div>
    </form>
  );
}

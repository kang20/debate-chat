import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isValidEmail, isValidPassword, isValidNickname } from '@/utils/validation';
import toast from 'react-hot-toast';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!isValidEmail(email)) errs.email = '올바른 이메일 형식이 아닙니다.';
    if (!isValidPassword(password)) errs.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!isValidNickname(nickname)) errs.nickname = '닉네임은 2~20자여야 ��니다.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await signup({ email, password, nickname });
      toast.success('회원가입이 완료되었습니다! 로그인해주세요.');
      navigate('/auth/login');
    } catch {
      toast.error('회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-center">회원가입</h1>
      <Input
        id="email"
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="이메일을 입력하세요"
        required
      />
      <Input
        id="nickname"
        label="닉네임"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        error={errors.nickname}
        placeholder="닉네임을 입력하세요 (2~20자)"
        required
      />
      <Input
        id="password"
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="비밀번호를 입력하세요 (8자 이상)"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '가입 중...' : '회원가입'}
      </Button>
      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/auth/login" className="text-indigo-600 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}

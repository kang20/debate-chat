import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/utils/date';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    try {
      await updateProfile({ nickname });
      setIsEditing(false);
      toast.success('프로필이 수정되었습니다.');
    } catch {
      toast.error('프로필 수정에 실패했습니다.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">내 프로필</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user.nickname} size="lg" />
          <div>
            <h2 className="text-lg font-semibold">{user.nickname}</h2>
            <p className="text-sm text-gray-500">{user.provider === 'GOOGLE' ? '구글' : '카카오'} 계정</p>
            <p className="text-xs text-gray-400">등급: {user.debateGrade} · 가입일: {formatDateTime(user.createdAt)}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <Input
              id="edit-nickname"
              label="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>저장</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                취소
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            프로필 수정
          </Button>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useArgumentStore } from '@/stores/argumentStore';
import { Button } from '@/components/ui/Button';
import type { Side } from '@/types/room';
import toast from 'react-hot-toast';

interface ArgumentFormProps {
  roomId: string;
  parentId?: string;
  onClose: () => void;
}

export function ArgumentForm({ roomId, parentId, onClose }: ArgumentFormProps) {
  const [content, setContent] = useState('');
  const [stance, setStance] = useState<Side>('PRO');
  const { addArgument } = useArgumentStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('논거 내용을 입력해주세요.');
      return;
    }
    try {
      await addArgument(roomId, { parentId, stance, content: content.trim() });
      toast.success('논거가 추가되었습니다.');
      onClose();
    } catch {
      toast.error('논거 추가에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setStance('PRO')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            stance === 'PRO' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
          }`}
        >
          찬성
        </button>
        <button
          type="button"
          onClick={() => setStance('CON')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            stance === 'CON' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'
          }`}
        >
          반대
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="논거를 입력하세요..."
        rows={3}
        className="mb-3 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" size="sm">
          추가
        </Button>
      </div>
    </form>
  );
}

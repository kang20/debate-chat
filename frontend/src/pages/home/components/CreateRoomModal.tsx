import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRoomStore } from '@/stores/roomStore';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
}

const availableTags = ['기술', '정책', '경제', '사회', '직장', '라이프스타일', '복지', '교육', '환경'];

export function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { createRoom } = useRoomStore();
  const navigate = useNavigate();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('토론 주제를 입력해주세요.');
      return;
    }
    try {
      const room = await createRoom({
        title: title.trim(),
        description: description.trim(),
        visibility: 'PUBLIC',
        tags: selectedTags,
      });
      toast.success('토론방이 생성되었습니다!');
      onClose();
      navigate(`/rooms/${room.id}`);
    } catch {
      toast.error('토론방 생성에 실패했습니���.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="새 토론방 만들기">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="room-title"
          label="토론 주제"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="토론 주제를 입력하세요"
          required
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="토론의 배경과 맥락을 설명해주세요"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">태그 선택</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">생성</Button>
        </div>
      </form>
    </Modal>
  );
}

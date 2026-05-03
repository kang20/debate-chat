import { useState } from 'react';
import { X } from 'lucide-react';
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

const popularTags = ['기술', '정책', '경제', '사회', '직장', '복지', '라이프스타일'];

function getDefaultStartTime() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [minParticipants, setMinParticipants] = useState(2);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [startTime, setStartTime] = useState(getDefaultStartTime);
  const { createRoom } = useRoomStore();
  const navigate = useNavigate();

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    try {
      const room = await createRoom({
        title: title.trim(),
        description: description.trim(),
        tags,
        minParticipants,
        maxParticipants,
        startTime: new Date(startTime).toISOString(),
      });
      toast.success('토론방이 생성되었습니다!');
      onClose();
      setTitle('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setMinParticipants(2);
      setMaxParticipants(10);
      setStartTime(getDefaultStartTime());
      navigate(`/rooms/${room.id}`);
    } catch {
      toast.error('토론방 생성에 실패했습니다.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="새 토론방 만들기">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="room-title"
          label="토론 주제"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: AI 규제, 지금 당장 필요한가?"
          maxLength={100}
          required
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">설명 *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="토론 주제에 대한 배경과 쟁점을 간단히 설명해주세요"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">태그</label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="태그 입력 후 Enter"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              추가
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-indigo-400 hover:text-indigo-700"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="mr-1 self-center text-[11px] text-gray-400">자주 쓰는 태그:</span>
            {popularTags
              .filter((t) => !tags.includes(t))
              .slice(0, 5)
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTags([...tags, t])}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 hover:bg-gray-200"
                >
                  #{t}
                </button>
              ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="min-participants" className="mb-1 block text-sm font-medium text-gray-700">
              최소 인원 (찬반)
            </label>
            <input
              id="min-participants"
              type="number"
              min={2}
              max={maxParticipants}
              value={minParticipants}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMinParticipants(v);
                if (v > maxParticipants) setMaxParticipants(v);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="max-participants" className="mb-1 block text-sm font-medium text-gray-700">
              최대 인원 (찬반)
            </label>
            <input
              id="max-participants"
              type="number"
              min={minParticipants}
              max={50}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="start-time" className="mb-1 block text-sm font-medium text-gray-700">
            토론 시작 일시
          </label>
          <input
            id="start-time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
          <p className="mt-1 text-[11px] text-gray-400">모집 완료 후 토론이 시작되는 예정 시각</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" className="flex-1" disabled={!title.trim() || !description.trim()}>
            토론방 생성
          </Button>
        </div>
      </form>
    </Modal>
  );
}

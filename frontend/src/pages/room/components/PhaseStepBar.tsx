import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';
import type { DebatePhase, DebateRoom } from '@/types/room';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface PhaseStepBarProps {
  room: DebateRoom;
}

const phases: { key: DebatePhase; label: string }[] = [
  { key: 'RECRUITING', label: '모집' },
  { key: 'OPENING', label: '입론' },
  { key: 'REBUTTAL', label: '반론' },
  { key: 'CLOSING', label: '최종 변론' },
];

export function PhaseStepBar({ room }: PhaseStepBarProps) {
  const { advancePhase } = useRoomStore();
  const { user } = useAuthStore();

  const isModerator = user?.id === room.moderatorId;
  const isClosed = room.status === 'CLOSED';
  const currentIdx = phases.findIndex((p) => p.key === room.phase);

  const handleAdvance = async () => {
    try {
      await advancePhase(room.id);
      toast.success('다음 단계로 전환되었습니다.');
    } catch {
      toast.error('단계 전환에 실패했습니다.');
    }
  };

  const canAdvance = isModerator && !isClosed && currentIdx < phases.length - 1;

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white px-5 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {phases.map((phase, idx) => {
            const isCompleted = isClosed ? true : idx < currentIdx;
            const isCurrent = !isClosed && idx === currentIdx;
            const isFuture = !isClosed && idx > currentIdx;

            return (
              <div key={phase.key} className="flex items-center">
                {idx > 0 && (
                  <ChevronRight size={14} className={cn('mx-1', isCompleted ? 'text-indigo-400' : 'text-gray-300')} />
                )}
                <div
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    isCompleted && 'bg-indigo-100 text-indigo-700',
                    isCurrent && 'bg-indigo-600 text-white',
                    isFuture && 'bg-gray-100 text-gray-400',
                  )}
                >
                  {isCompleted && <Check size={12} />}
                  {phase.label}
                </div>
              </div>
            );
          })}
          {isClosed && (
            <>
              <ChevronRight size={14} className="mx-1 text-gray-400" />
              <span className="rounded-full bg-gray-800 px-3 py-1.5 text-xs font-bold text-white">종료됨</span>
            </>
          )}
        </div>
        {canAdvance && (
          <Button size="sm" onClick={handleAdvance}>
            다음 단계로
          </Button>
        )}
      </div>
    </div>
  );
}

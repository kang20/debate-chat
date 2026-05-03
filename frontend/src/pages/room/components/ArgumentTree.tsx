import { useEffect, useState } from 'react';
import { Plus, TreePine } from 'lucide-react';
import { useArgumentStore } from '@/stores/argumentStore';
import { useAuthStore } from '@/stores/authStore';
import { ArgumentNode } from './ArgumentNode';
import { ArgumentForm } from './ArgumentForm';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { DebatePhase, Side } from '@/types/room';

interface ArgumentTreeProps {
  roomId: string;
  phase: DebatePhase;
  mySide?: Side;
  isModerator: boolean;
  isClosed: boolean;
}

export function ArgumentTree({ roomId, phase, mySide, isModerator, isClosed }: ArgumentTreeProps) {
  const { tree, isLoading, fetchTree } = useArgumentStore();
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTree(roomId);
  }, [roomId, fetchTree]);

  if (isLoading) return <PageSpinner />;

  // Only PRO/CON participants can add arguments (not moderator, not neutral)
  const canAddArgument = isAuthenticated && !isModerator && !isClosed
    && (mySide === 'PRO' || mySide === 'CON');

  // Phase-based restrictions
  const canAddRoot = canAddArgument && phase !== 'RECRUITING';
  const canReply = canAddArgument && (phase === 'REBUTTAL' || phase === 'CLOSING');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">논거 트리</h3>
        {canAddRoot && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} />
            논거 추가
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <ArgumentForm
            roomId={roomId}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {tree.length === 0 ? (
        <EmptyState
          icon={<TreePine size={40} />}
          title="아직 논거가 없습니다"
          description={
            phase === 'RECRUITING'
              ? '모집이 완료되면 논거를 추가할 수 있습니다.'
              : '첫 번째 논거를 추가해 토론을 구조화해보세요.'
          }
        />
      ) : (
        <div className="space-y-3">
          {tree.map((arg) => (
            <ArgumentNode
              key={arg.id}
              argument={arg}
              roomId={roomId}
              isParticipant={canReply}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

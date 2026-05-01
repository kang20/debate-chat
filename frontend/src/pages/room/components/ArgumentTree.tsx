import { useEffect, useState } from 'react';
import { Plus, TreePine } from 'lucide-react';
import { useArgumentStore } from '@/stores/argumentStore';
import { useAuthStore } from '@/stores/authStore';
import { ArgumentNode } from './ArgumentNode';
import { ArgumentForm } from './ArgumentForm';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface ArgumentTreeProps {
  roomId: string;
  isParticipant: boolean;
}

export function ArgumentTree({ roomId, isParticipant }: ArgumentTreeProps) {
  const { tree, isLoading, fetchTree } = useArgumentStore();
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTree(roomId);
  }, [roomId, fetchTree]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">논거 트리</h3>
        {isAuthenticated && isParticipant && (
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
          description="첫 번째 논거를 추가해 토론을 구조화해보세요."
        />
      ) : (
        <div className="space-y-3">
          {tree.map((arg) => (
            <ArgumentNode
              key={arg.id}
              argument={arg}
              roomId={roomId}
              isParticipant={isParticipant}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

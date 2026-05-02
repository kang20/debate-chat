import type { RoomParticipant, Side } from '@/types/room';
import { Avatar } from '@/components/ui/Avatar';
import { SideBadge } from '@/components/ui/Badge';
import { Crown } from 'lucide-react';

interface ParticipantSidebarProps {
  participants: RoomParticipant[];
  moderatorNickname: string;
  maxParticipants: number;
}

const sideOrder: Side[] = ['PRO', 'CON', 'NEUTRAL'];
const sideLabels: Record<Side, string> = {
  PRO: '찬성',
  CON: '반대',
  NEUTRAL: '중립',
};

export function ParticipantSidebar({ participants, moderatorNickname, maxParticipants }: ParticipantSidebarProps) {
  const proConCount = participants.filter((p) => p.side === 'PRO' || p.side === 'CON').length;

  const grouped = sideOrder.map((side) => ({
    side,
    label: sideLabels[side],
    members: participants.filter((p) => p.side === side),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Moderator */}
      <div className="mb-4 border-b border-gray-100 pb-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <Crown size={14} />
          진행자
        </div>
        <div className="flex items-center gap-2">
          <Avatar name={moderatorNickname} size="sm" />
          <span className="text-sm font-medium text-gray-700">{moderatorNickname}</span>
        </div>
      </div>

      <h3 className="mb-1 text-sm font-semibold text-gray-900">참여자 ({participants.length})</h3>
      <p className="mb-3 text-[11px] text-gray-400">찬반 {proConCount}/{maxParticipants}명</p>

      <div className="space-y-4">
        {grouped.map(({ side, label, members }) => (
          <div key={side}>
            <div className="mb-2 flex items-center gap-2">
              <SideBadge side={side} />
              <span className="text-xs text-gray-500">{members.length}명</span>
            </div>
            <div className="space-y-2">
              {members.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Avatar name={p.nickname} size="sm" />
                  <span className="text-sm text-gray-700">{p.nickname}</span>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-xs text-gray-400">아직 {label} 참여자가 없습니다</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

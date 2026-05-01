import { useState } from 'react';
import { ArrowLeft, Lock, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { DebateRoom, Side } from '@/types/room';
import { Badge, SideBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';
import { relativeTime } from '@/utils/date';
import toast from 'react-hot-toast';

interface RoomHeaderProps {
  room: DebateRoom;
  isParticipant: boolean;
  mySide?: Side;
}

export function RoomHeader({ room, isParticipant, mySide }: RoomHeaderProps) {
  const navigate = useNavigate();
  const { joinRoom, leaveRoom, closeRoom } = useRoomStore();
  const { user, isAuthenticated } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const isOwner = user?.id === room.ownerId;
  const isClosed = room.status === 'CLOSED';

  const handleJoin = async (side: Side) => {
    try {
      await joinRoom(room.id, side);
      setShowJoinModal(false);
      toast.success('토론방에 참여했습니다!');
    } catch {
      toast.error('참여에 실패했습니다.');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveRoom(room.id);
      toast.success('토론방에서 나왔습니다.');
    } catch {
      toast.error('나가기에 실패했습니다.');
    }
  };

  const handleClose = async () => {
    if (!confirm('정말 토론방을 종료하시겠습니까?')) return;
    try {
      await closeRoom(room.id);
      toast.success('토론방이 종료되었습니다.');
    } catch {
      toast.error('종료에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-start gap-3">
          <button onClick={() => navigate('/')} className="mt-1 text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{room.title}</h1>
              {isClosed && <Badge className="bg-gray-800 text-white">종료</Badge>}
              {room.visibility === 'PRIVATE' && (
                <Lock size={14} className="text-gray-400" />
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">{room.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {room.tags.map((tag) => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={16} />
              참여자 {room.participantCount}명
            </span>
            <span className="text-blue-600">찬성 {room.proCount}</span>
            <span className="text-red-600">반대 {room.conCount}</span>
            <span>중립 {room.neutralCount}</span>
            <span>{relativeTime(room.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && !isClosed && (
              isParticipant ? (
                <div className="flex items-center gap-2">
                  {mySide && <SideBadge side={mySide} />}
                  <Button size="sm" variant="ghost" onClick={handleLeave}>
                    나가기
                  </Button>
                  {isOwner && (
                    <Button size="sm" variant="danger" onClick={handleClose}>
                      토론 종료
                    </Button>
                  )}
                </div>
              ) : (
                <Button size="sm" onClick={() => setShowJoinModal(true)}>
                  참여하기
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <Modal open={showJoinModal} onClose={() => setShowJoinModal(false)} title="입장 선택">
        <p className="mb-4 text-sm text-gray-600">어떤 입장으로 참여하시겠습니까?</p>
        <div className="flex flex-col gap-3">
          <Button variant="pro" onClick={() => handleJoin('PRO')}>
            찬성 (PRO)
          </Button>
          <Button variant="con" onClick={() => handleJoin('CON')}>
            반대 (CON)
          </Button>
          <Button variant="secondary" onClick={() => handleJoin('NEUTRAL')}>
            중립 (NEUTRAL)
          </Button>
        </div>
      </Modal>
    </>
  );
}

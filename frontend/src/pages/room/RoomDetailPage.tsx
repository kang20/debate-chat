import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { MessageCircle, TreePine } from 'lucide-react';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';
import { RoomHeader } from './components/RoomHeader';
import { ChatPanel } from './components/ChatPanel';
import { ArgumentTree } from './components/ArgumentTree';
import { ParticipantSidebar } from './components/ParticipantSidebar';
import { PageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

type Tab = 'chat' | 'argument';

export function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentRoom, participants, isLoading, fetchRoom } = useRoomStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  useEffect(() => {
    if (roomId) fetchRoom(roomId);
  }, [roomId, fetchRoom]);

  if (isLoading || !currentRoom) return <PageSpinner />;

  const myParticipation = participants.find((p) => p.userId === user?.id);
  const isParticipant = !!myParticipation;

  return (
    <div>
      <RoomHeader
        room={currentRoom}
        isParticipant={isParticipant}
        mySide={myParticipation?.side}
      />

      {/* Tab switcher */}
      <div className="mb-4 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'chat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <MessageCircle size={16} />
          채팅
        </button>
        <button
          onClick={() => setActiveTab('argument')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'argument'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <TreePine size={16} />
          논거 트리
        </button>
      </div>

      {/* Content */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {activeTab === 'chat' ? (
            <ChatPanel roomId={currentRoom.id} isParticipant={isParticipant} />
          ) : (
            <ArgumentTree roomId={currentRoom.id} isParticipant={isParticipant} />
          )}
        </div>
        <div className="hidden w-64 shrink-0 lg:block">
          <ParticipantSidebar participants={participants} />
        </div>
      </div>
    </div>
  );
}

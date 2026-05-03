import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { MessageCircle, MessageSquare, TreePine } from 'lucide-react';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';
import { RoomHeader } from './components/RoomHeader';
import { PhaseStepBar } from './components/PhaseStepBar';
import { ChatPanel } from './components/ChatPanel';
import { ArgumentTree } from './components/ArgumentTree';
import { ParticipantSidebar } from './components/ParticipantSidebar';
import { PageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import type { Side } from '@/types/room';

type Tab = 'debate' | 'neutral' | 'args';

export function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentRoom, participants, isLoading, fetchRoom } = useRoomStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('debate');

  useEffect(() => {
    if (roomId) fetchRoom(roomId);
  }, [roomId, fetchRoom]);

  if (isLoading || !currentRoom) return <PageSpinner />;

  const myParticipation = participants.find((p) => p.userId === user?.id);
  const isParticipant = !!myParticipation;
  const mySide: Side | undefined = myParticipation?.side;
  const isModerator = user?.id === currentRoom.moderatorId;
  const isClosed = currentRoom.status === 'CLOSED';

  // Tab visibility rules
  const showNeutralTab = mySide === 'NEUTRAL' || isModerator;
  const showArgsTab = isParticipant || isModerator;

  // Chat permissions
  const canSendDebate = !isClosed && (mySide === 'PRO' || mySide === 'CON') && currentRoom.phase !== 'RECRUITING';
  const canSendNeutral = !isClosed && mySide === 'NEUTRAL';

  // Ensure tab is valid for current role
  if (activeTab === 'neutral' && !showNeutralTab) setActiveTab('debate');
  if (activeTab === 'args' && !showArgsTab) setActiveTab('debate');

  const total = currentRoom.proCount + currentRoom.conCount + currentRoom.neutralCount;
  const proPct = total ? (currentRoom.proCount / total) * 100 : 50;
  const conPct = total ? (currentRoom.conCount / total) * 100 : 50;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: 'debate', label: '토론 채팅', icon: <MessageCircle size={16} />, show: true },
    { key: 'neutral', label: '중립 채팅', icon: <MessageSquare size={16} />, show: showNeutralTab },
    { key: 'args', label: '논거 트리', icon: <TreePine size={16} />, show: showArgsTab },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div>
      <RoomHeader
        room={currentRoom}
        isParticipant={isParticipant}
        mySide={mySide}
      />

      <PhaseStepBar room={currentRoom} />

      {/* Stance summary bar */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white px-5 py-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-blue-600">찬성 {currentRoom.proCount}</span>
          <span className="text-gray-400">중립 {currentRoom.neutralCount}</span>
          <span className="font-semibold text-red-600">반대 {currentRoom.conCount}</span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="bg-blue-500 transition-all" style={{ width: `${proPct}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${conPct}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          {/* Pill tab switcher */}
          <div className="mb-3 flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.key ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'debate' && (
            <ChatPanel
              roomId={currentRoom.id}
              channel="DEBATE"
              canSend={canSendDebate}
              readOnlyMessage={
                isClosed ? '종료된 토론입니다.' :
                !isParticipant && !isModerator ? '토론에 참여해야 메시지를 보낼 수 있습니다.' :
                isModerator ? '진행자는 채팅에 참여할 수 없습니다.' :
                mySide === 'NEUTRAL' ? '중립 참여자는 토론 채팅에 참여할 수 없습니다.' :
                currentRoom.phase === 'RECRUITING' ? '모집 중에는 토론 채팅을 사용할 수 없습니다.' :
                undefined
              }
            />
          )}
          {activeTab === 'neutral' && (
            <ChatPanel
              roomId={currentRoom.id}
              channel="NEUTRAL"
              canSend={canSendNeutral}
              readOnlyMessage={
                isClosed ? '종료된 토론입니다.' :
                isModerator ? '진행자는 채팅에 참여할 수 없습니다.' :
                undefined
              }
            />
          )}
          {activeTab === 'args' && (
            <ArgumentTree
              roomId={currentRoom.id}
              phase={currentRoom.phase}
              mySide={mySide}
              isModerator={isModerator}
              isClosed={isClosed}
            />
          )}
        </div>
        <div className="hidden lg:block">
          <ParticipantSidebar
            participants={participants}
            moderatorNickname={currentRoom.moderatorNickname}
            maxParticipants={currentRoom.maxParticipants}
          />
        </div>
      </div>
    </div>
  );
}

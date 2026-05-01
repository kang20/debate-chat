import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, AtSign, MessageSquare, ThumbsUp, Reply, DoorClosed, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { relativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';
import type { NotificationType } from '@/types/notification';

const typeConfig: Record<NotificationType, { icon: typeof Bell; label: string; color: string }> = {
  MENTION: { icon: AtSign, label: '멘션', color: 'text-blue-500' },
  REPLY: { icon: Reply, label: '답글', color: 'text-indigo-500' },
  NEW_MESSAGE: { icon: MessageSquare, label: '새 메시지', color: 'text-green-500' },
  ARGUMENT_REPLY: { icon: Reply, label: '논거 답글', color: 'text-purple-500' },
  VOTE: { icon: ThumbsUp, label: '투표', color: 'text-orange-500' },
  ROOM_CLOSED: { icon: DoorClosed, label: '토론 종료', color: 'text-gray-500' },
};

export function NotificationsPage() {
  const { notifications, isLoading, unreadCount, fetchNotifications, markRead, markAllRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (isLoading && notifications.length === 0) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">알림</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">읽지 않은 알림 {unreadCount}개</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="secondary" onClick={markAllRead}>
            <CheckCheck size={16} />
            모두 읽음
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} />}
          title="알림이 없습니다"
          description="토론에 참여하면 알림을 받을 수 있습니다."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((noti) => {
            const config = typeConfig[noti.type];
            const Icon = config.icon;
            const isUnread = !noti.readAt;

            return (
              <button
                key={noti.id}
                onClick={() => {
                  if (isUnread) markRead(noti.id);
                  if (noti.payload.roomId) navigate(`/rooms/${noti.payload.roomId}`);
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50',
                  isUnread ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 bg-white'
                )}
              >
                <div className={cn('mt-0.5', config.color)}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-gray-500">{config.label}</span>
                    {isUnread && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-800">
                    <strong>{noti.payload.actorNickname}</strong>님이{' '}
                    <strong>{noti.payload.roomTitle}</strong>에서{' '}
                    {noti.type === 'MENTION' && '회원님을 멘션했습니다.'}
                    {noti.type === 'ARGUMENT_REPLY' && '논거에 답글을 달았습니다.'}
                    {noti.type === 'VOTE' && '논거에 투표했습니다.'}
                    {noti.type === 'ROOM_CLOSED' && '토론을 종료했습니다.'}
                    {noti.type === 'REPLY' && '답글을 달았습니다.'}
                    {noti.type === 'NEW_MESSAGE' && '새 메시지를 보냈습니다.'}
                  </p>
                  {noti.payload.messagePreview && (
                    <p className="mt-1 text-xs text-gray-500 truncate">{noti.payload.messagePreview}</p>
                  )}
                  <p className="mt-1 text-[10px] text-gray-400">{relativeTime(noti.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

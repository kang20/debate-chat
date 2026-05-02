import type { Message } from '@/types/message';
import { Avatar } from '@/components/ui/Avatar';
import { SideBadge } from '@/components/ui/Badge';
import { formatTime } from '@/utils/date';
import { cn } from '@/utils/cn';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  if (message.deleted) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 italic">[삭제된 메시지]</span>
      </div>
    );
  }

  // System message rendering
  if (message.isSystem) {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2', isOwn && 'flex-row-reverse')}>
      <Avatar name={message.authorNickname} size="sm" className="shrink-0 mt-1" />
      <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
        <div className={cn('flex items-center gap-2 mb-1', isOwn && 'flex-row-reverse')}>
          <span className="text-xs font-medium text-gray-700">{message.authorNickname}</span>
          <SideBadge side={message.sideAtSend} />
          <span className="text-[10px] text-gray-400">{formatTime(message.createdAt)}</span>
          {message.editedAt && <span className="text-[10px] text-gray-400">(수정됨)</span>}
        </div>
        <div
          className={cn(
            'rounded-xl px-3 py-2 text-sm',
            isOwn
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

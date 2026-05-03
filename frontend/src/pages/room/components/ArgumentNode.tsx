import { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import type { Argument } from '@/types/argument';
import { useArgumentStore } from '@/stores/argumentStore';
import { useAuthStore } from '@/stores/authStore';
import { ArgumentForm } from './ArgumentForm';
import { cn } from '@/utils/cn';
import { relativeTime } from '@/utils/date';

interface ArgumentNodeProps {
  argument: Argument;
  roomId: string;
  isParticipant: boolean;
  depth: number;
}

export function ArgumentNode({ argument, roomId, isParticipant, depth }: ArgumentNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { vote, removeVote } = useArgumentStore();
  const { isAuthenticated } = useAuthStore();

  const isPro = argument.stance === 'PRO';
  const hasChildren = argument.children.length > 0;

  const handleVote = async (value: 'AGREE' | 'DISAGREE') => {
    if (!isAuthenticated) return;
    if (argument.myVote === value) {
      await removeVote(argument.id);
    } else {
      await vote(argument.id, value);
    }
  };

  if (argument.deleted) {
    return (
      <div className="ml-4 border-l-2 border-gray-200 pl-4 py-2">
        <span className="text-sm text-gray-400 italic">[삭제된 논거]</span>
        {hasChildren && expanded && (
          <div className="mt-2 space-y-2">
            {argument.children.map((child) => (
              <ArgumentNode
                key={child.id}
                argument={child}
                roomId={roomId}
                isParticipant={isParticipant}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-3',
        isPro ? 'border-l-blue-500 bg-blue-50/50' : 'border-l-red-500 bg-red-50/50',
        depth > 0 && 'ml-4'
      )}
    >
      <div className="flex items-start gap-2">
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-0.5 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                isPro ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              )}
            >
              {isPro ? '찬성' : '반대'}
            </span>
            <span className="text-xs font-medium text-gray-600">{argument.authorNickname}</span>
            <span className="text-[10px] text-gray-400">{relativeTime(argument.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-800 mb-2">{argument.content}</p>

          {/* Vote buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote('AGREE')}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
                argument.myVote === 'AGREE'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-400 hover:text-green-600'
              )}
            >
              <ThumbsUp size={12} />
              {argument.agreeCount}
            </button>
            <button
              onClick={() => handleVote('DISAGREE')}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
                argument.myVote === 'DISAGREE'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-400 hover:text-red-600'
              )}
            >
              <ThumbsDown size={12} />
              {argument.disagreeCount}
            </button>
            {isParticipant && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600"
              >
                <Plus size={12} />
                답글
              </button>
            )}
            {hasChildren && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MessageSquare size={12} />
                {argument.children.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-3 ml-6">
          <ArgumentForm
            roomId={roomId}
            parentId={argument.id}
            onClose={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {hasChildren && expanded && (
        <div className="mt-2 space-y-2">
          {argument.children.map((child) => (
            <ArgumentNode
              key={child.id}
              argument={child}
              roomId={roomId}
              isParticipant={isParticipant}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

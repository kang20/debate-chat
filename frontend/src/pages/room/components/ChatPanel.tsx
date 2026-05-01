import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { chatSimulator } from '@/mocks/chatSimulator';
import { ChatMessage } from './ChatMessage';
import { Spinner } from '@/components/ui/Spinner';
import type { Message } from '@/types/message';

interface ChatPanelProps {
  roomId: string;
  isParticipant: boolean;
}

export function ChatPanel({ roomId, isParticipant }: ChatPanelProps) {
  const { messages, isLoading, hasMore, fetchMessages, fetchOlderMessages, sendMessage, addIncomingMessage, clearMessages } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    clearMessages();
    fetchMessages(roomId);

    if (import.meta.env.VITE_USE_MOCK === 'true') {
      chatSimulator.start(roomId);
    }

    const handleNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.roomId === roomId) {
        addIncomingMessage(detail.message as Message);
      }
    };

    window.addEventListener('mock-new-message', handleNewMessage);
    return () => {
      chatSimulator.stop();
      window.removeEventListener('mock-new-message', handleNewMessage);
    };
  }, [roomId, fetchMessages, clearMessages, addIncomingMessage]);

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMore && !isLoading) {
      fetchOlderMessages(roomId);
    }

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  const handleSend = async () => {
    if (!input.trim() || !isParticipant) return;
    const content = input.trim();
    setInput('');
    try {
      await sendMessage(roomId, content);
      setAutoScroll(true);
    } catch {
      setInput(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[500px] flex-col rounded-xl border border-gray-200 bg-white">
      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
        {hasMore && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => fetchOlderMessages(roomId)}
              className="text-xs text-indigo-600 hover:underline"
            >
              이전 메시지 불러오기
            </button>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwn={msg.authorId === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3">
        {isParticipant ? (
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-lg bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">
            토론에 참여해야 메시지를 보낼 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
}

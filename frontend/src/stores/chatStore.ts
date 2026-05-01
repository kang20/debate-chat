import { create } from 'zustand';
import { messageApi } from '@/api/messageApi';
import type { Message } from '@/types/message';

interface ChatState {
  messages: Message[];
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;

  fetchMessages: (roomId: string) => Promise<void>;
  fetchOlderMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addIncomingMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  cursor: null,
  hasMore: true,
  isLoading: false,

  fetchMessages: async (roomId) => {
    set({ isLoading: true });
    try {
      const res = await messageApi.list(roomId);
      set({ messages: res.content, cursor: res.nextCursor, hasMore: res.hasMore, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchOlderMessages: async (roomId) => {
    const { cursor, hasMore, isLoading } = get();
    if (!hasMore || isLoading || !cursor) return;
    set({ isLoading: true });
    try {
      const res = await messageApi.list(roomId, cursor);
      set((s) => ({
        messages: [...res.content, ...s.messages],
        cursor: res.nextCursor,
        hasMore: res.hasMore,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (roomId, content) => {
    const msg = await messageApi.send(roomId, { content });
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  editMessage: async (messageId, content) => {
    const updated = await messageApi.edit(messageId, { content });
    set((s) => ({
      messages: s.messages.map((m) => (m.id === messageId ? updated : m)),
    }));
  },

  deleteMessage: async (messageId) => {
    await messageApi.delete(messageId);
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, deleted: true, content: '' } : m
      ),
    }));
  },

  addIncomingMessage: (message) => {
    set((s) => {
      if (s.messages.some((m) => m.id === message.id)) return s;
      return { messages: [...s.messages, message] };
    });
  },

  clearMessages: () => set({ messages: [], cursor: null, hasMore: true }),
}));

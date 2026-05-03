import { create } from 'zustand';
import { messageApi } from '@/api/messageApi';
import type { Message } from '@/types/message';
import type { ChatChannel } from '@/types/room';

interface ChannelState {
  messages: Message[];
  cursor: string | null;
  hasMore: boolean;
}

interface ChatState {
  debate: ChannelState;
  neutral: ChannelState;
  activeChannel: ChatChannel;
  isLoading: boolean;

  fetchMessages: (roomId: string, channel: ChatChannel) => Promise<void>;
  fetchOlderMessages: (roomId: string, channel: ChatChannel) => Promise<void>;
  sendMessage: (roomId: string, content: string, channel: ChatChannel) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addIncomingMessage: (message: Message) => void;
  setActiveChannel: (channel: ChatChannel) => void;
  clearMessages: () => void;
}

const emptyChannel: ChannelState = { messages: [], cursor: null, hasMore: true };

function channelKey(channel: ChatChannel): 'debate' | 'neutral' {
  return channel === 'DEBATE' ? 'debate' : 'neutral';
}

export const useChatStore = create<ChatState>((set, get) => ({
  debate: { ...emptyChannel },
  neutral: { ...emptyChannel },
  activeChannel: 'DEBATE',
  isLoading: false,

  fetchMessages: async (roomId, channel) => {
    set({ isLoading: true });
    try {
      const res = await messageApi.list(roomId, undefined, channel);
      const key = channelKey(channel);
      set({
        [key]: { messages: res.content, cursor: res.nextCursor, hasMore: res.hasMore },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchOlderMessages: async (roomId, channel) => {
    const key = channelKey(channel);
    const ch = get()[key];
    if (!ch.hasMore || get().isLoading || !ch.cursor) return;
    set({ isLoading: true });
    try {
      const res = await messageApi.list(roomId, ch.cursor, channel);
      set((s) => ({
        [key]: {
          messages: [...res.content, ...s[key].messages],
          cursor: res.nextCursor,
          hasMore: res.hasMore,
        },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (roomId, content, channel) => {
    const msg = await messageApi.send(roomId, { content, channel });
    const key = channelKey(channel);
    set((s) => ({
      [key]: { ...s[key], messages: [...s[key].messages, msg] },
    }));
  },

  editMessage: async (messageId, content) => {
    const updated = await messageApi.edit(messageId, { content });
    set((s) => {
      const updateMessages = (msgs: Message[]) =>
        msgs.map((m) => (m.id === messageId ? updated : m));
      return {
        debate: { ...s.debate, messages: updateMessages(s.debate.messages) },
        neutral: { ...s.neutral, messages: updateMessages(s.neutral.messages) },
      };
    });
  },

  deleteMessage: async (messageId) => {
    await messageApi.delete(messageId);
    set((s) => {
      const updateMessages = (msgs: Message[]) =>
        msgs.map((m) => (m.id === messageId ? { ...m, deleted: true, content: '' } : m));
      return {
        debate: { ...s.debate, messages: updateMessages(s.debate.messages) },
        neutral: { ...s.neutral, messages: updateMessages(s.neutral.messages) },
      };
    });
  },

  addIncomingMessage: (message) => {
    const key = channelKey(message.channel);
    set((s) => {
      const ch = s[key];
      if (ch.messages.some((m) => m.id === message.id)) return s;
      return { [key]: { ...ch, messages: [...ch.messages, message] } };
    });
  },

  setActiveChannel: (channel) => set({ activeChannel: channel }),

  clearMessages: () => set({
    debate: { ...emptyChannel },
    neutral: { ...emptyChannel },
  }),
}));

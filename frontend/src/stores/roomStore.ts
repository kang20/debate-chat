import { create } from 'zustand';
import { roomApi } from '@/api/roomApi';
import type { DebateRoom, RoomParticipant, CreateRoomRequest, Side } from '@/types/room';

interface RoomState {
  rooms: DebateRoom[];
  currentRoom: DebateRoom | null;
  participants: RoomParticipant[];
  page: number;
  totalPages: number;
  filters: { tag?: string; q?: string; status?: string };
  isLoading: boolean;

  fetchRooms: () => Promise<void>;
  fetchRoom: (id: string) => Promise<void>;
  createRoom: (data: CreateRoomRequest) => Promise<DebateRoom>;
  joinRoom: (roomId: string, side: Side) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  closeRoom: (roomId: string) => Promise<void>;
  setFilters: (filters: Partial<RoomState['filters']>) => void;
  setPage: (page: number) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  participants: [],
  page: 0,
  totalPages: 0,
  filters: {},
  isLoading: false,

  fetchRooms: async () => {
    set({ isLoading: true });
    try {
      const { page, filters } = get();
      const res = await roomApi.list({ page, size: 9, ...filters });
      set({ rooms: res.content, totalPages: res.totalPages, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchRoom: async (id) => {
    set({ isLoading: true });
    try {
      const [room, participants] = await Promise.all([
        roomApi.get(id),
        roomApi.getParticipants(id),
      ]);
      set({ currentRoom: room, participants, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createRoom: async (data) => {
    const room = await roomApi.create(data);
    const { rooms } = get();
    set({ rooms: [room, ...rooms] });
    return room;
  },

  joinRoom: async (roomId, side) => {
    await roomApi.join(roomId, { side });
    const participants = await roomApi.getParticipants(roomId);
    set({ participants });
  },

  leaveRoom: async (roomId) => {
    await roomApi.leave(roomId);
    const participants = await roomApi.getParticipants(roomId);
    set({ participants });
  },

  closeRoom: async (roomId) => {
    await roomApi.close(roomId);
    const room = await roomApi.get(roomId);
    set({ currentRoom: room });
  },

  setFilters: (filters) => {
    set((s) => ({ filters: { ...s.filters, ...filters }, page: 0 }));
  },

  setPage: (page) => set({ page }),
}));

export type Side = 'PRO' | 'CON' | 'NEUTRAL';
export type RoomStatus = 'RECRUITING' | 'IN_PROGRESS' | 'CLOSED';
export type DebatePhase = 'RECRUITING' | 'OPENING' | 'REBUTTAL' | 'CLOSING';
export type ChatChannel = 'DEBATE' | 'NEUTRAL';

export interface Tag {
  id: string;
  name: string;
}

export interface DebateRoom {
  id: string;
  title: string;
  description: string;
  moderatorId: string;
  moderatorNickname: string;
  status: RoomStatus;
  phase: DebatePhase;
  tags: Tag[];
  minParticipants: number;
  maxParticipants: number;
  startTime: string;
  participantCount: number;
  proCount: number;
  conCount: number;
  neutralCount: number;
  createdAt: string;
  closedAt: string | null;
}

export interface RoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  nickname: string;
  avatarUrl: string;
  side: Side;
  joinedAt: string;
}

export interface CreateRoomRequest {
  title: string;
  description: string;
  tags: string[];
  minParticipants: number;
  maxParticipants: number;
  startTime: string;
}

export interface JoinRoomRequest {
  side: Side;
}

export type Side = 'PRO' | 'CON' | 'NEUTRAL';
export type Visibility = 'PUBLIC' | 'PRIVATE';
export type RoomStatus = 'OPEN' | 'CLOSED';

export interface Tag {
  id: string;
  name: string;
}

export interface DebateRoom {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  ownerNickname: string;
  visibility: Visibility;
  status: RoomStatus;
  tags: Tag[];
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
  visibility: Visibility;
  tags: string[];
}

export interface JoinRoomRequest {
  side: Side;
}

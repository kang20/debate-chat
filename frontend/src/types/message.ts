import type { Side } from './room';

export interface Message {
  id: string;
  roomId: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string;
  content: string;
  sideAtSend: Side;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
}

export interface SendMessageRequest {
  content: string;
}

export interface EditMessageRequest {
  content: string;
}

export interface CursorPageResponse<T> {
  content: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

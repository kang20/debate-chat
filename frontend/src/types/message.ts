import type { Side, ChatChannel } from './room';

export interface Message {
  id: string;
  roomId: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string;
  content: string;
  sideAtSend: Side;
  channel: ChatChannel;
  isSystem: boolean;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
}

export interface SendMessageRequest {
  content: string;
  channel: ChatChannel;
}

export interface EditMessageRequest {
  content: string;
}

export interface CursorPageResponse<T> {
  content: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

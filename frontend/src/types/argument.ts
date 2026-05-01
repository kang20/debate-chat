import type { Side } from './room';

export type VoteValue = 'AGREE' | 'DISAGREE';

export interface Argument {
  id: string;
  roomId: string;
  parentId: string | null;
  stance: Side;
  authorId: string;
  authorNickname: string;
  content: string;
  agreeCount: number;
  disagreeCount: number;
  myVote: VoteValue | null;
  children: Argument[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface CreateArgumentRequest {
  parentId?: string;
  stance: Side;
  content: string;
}

export interface VoteRequest {
  value: VoteValue;
}

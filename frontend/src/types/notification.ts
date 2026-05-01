export type NotificationType =
  | 'MENTION'
  | 'REPLY'
  | 'NEW_MESSAGE'
  | 'ARGUMENT_REPLY'
  | 'VOTE'
  | 'ROOM_CLOSED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  payload: {
    roomId?: string;
    roomTitle?: string;
    actorNickname?: string;
    argumentId?: string;
    messagePreview?: string;
  };
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreference {
  type: NotificationType;
  enabled: boolean;
}

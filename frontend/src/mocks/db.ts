import type { User } from '@/types/user';
import type { DebateRoom, RoomParticipant } from '@/types/room';
import type { Message } from '@/types/message';
import type { Argument } from '@/types/argument';
import type { Notification } from '@/types/notification';
import { seedUsers, seedPasswords } from './data/users';
import { seedRooms, seedParticipants } from './data/rooms';
import { seedMessages } from './data/messages';
import { seedArguments } from './data/arguments';
import { seedNotifications } from './data/notifications';

class MockDatabase {
  users = new Map<string, User>();
  passwords = new Map<string, string>();
  rooms = new Map<string, DebateRoom>();
  participants: RoomParticipant[] = [];
  messages: Message[] = [];
  arguments: Argument[] = [];
  notifications: Notification[] = [];
  sessions = new Map<string, string>(); // token -> userId

  private idCounter = 100;

  constructor() {
    this.reset();
  }

  reset() {
    this.users.clear();
    this.passwords.clear();
    this.rooms.clear();
    this.sessions.clear();

    seedUsers.forEach((u) => this.users.set(u.id, { ...u }));
    Object.entries(seedPasswords).forEach(([email, pw]) => this.passwords.set(email, pw));
    seedRooms.forEach((r) => this.rooms.set(r.id, { ...r }));
    this.participants = seedParticipants.map((p) => ({ ...p }));
    this.messages = seedMessages.map((m) => ({ ...m }));
    this.arguments = seedArguments.map((a) => this.deepCopyArgument(a));
    this.notifications = seedNotifications.map((n) => ({ ...n }));
  }

  private deepCopyArgument(arg: Argument): Argument {
    return {
      ...arg,
      children: arg.children.map((c) => this.deepCopyArgument(c)),
    };
  }

  nextId(prefix: string) {
    return `${prefix}-${++this.idCounter}`;
  }

  getUserByToken(token: string): User | undefined {
    const userId = this.sessions.get(token);
    return userId ? this.users.get(userId) : undefined;
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  getParticipantsForRoom(roomId: string): RoomParticipant[] {
    return this.participants.filter((p) => p.roomId === roomId);
  }

  getMessagesForRoom(roomId: string): Message[] {
    return this.messages
      .filter((m) => m.roomId === roomId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getArgumentsForRoom(roomId: string): Argument[] {
    return this.arguments.filter((a) => a.roomId === roomId && a.parentId === null);
  }

  findArgumentById(id: string, nodes: Argument[] = this.arguments): Argument | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = this.findArgumentById(id, node.children);
      if (found) return found;
    }
    return undefined;
  }

  getNotificationsForUser(userId: string): Notification[] {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const db = new MockDatabase();

import type { User } from '@/types/user';
import type { DebateRoom, RoomParticipant, ChatChannel } from '@/types/room';
import type { Message } from '@/types/message';
import type { Argument } from '@/types/argument';
import { seedUsers, seedOAuthCodes } from './data/users';
import { seedRooms, seedParticipants } from './data/rooms';
import { seedMessages } from './data/messages';
import { seedArguments } from './data/arguments';

class MockDatabase {
  users = new Map<string, User>();
  oauthCodes = new Map<string, string>(); // code -> userId
  rooms = new Map<string, DebateRoom>();
  participants: RoomParticipant[] = [];
  messages: Message[] = [];
  arguments: Argument[] = [];
  sessions = new Map<string, string>(); // token -> userId

  private idCounter = 100;

  constructor() {
    this.reset();
  }

  reset() {
    this.users.clear();
    this.oauthCodes.clear();
    this.rooms.clear();
    this.sessions.clear();

    seedUsers.forEach((u) => this.users.set(u.id, { ...u }));
    Object.entries(seedOAuthCodes).forEach(([code, userId]) => this.oauthCodes.set(code, userId));
    seedRooms.forEach((r) => this.rooms.set(r.id, { ...r }));
    this.participants = seedParticipants.map((p) => ({ ...p }));
    this.messages = seedMessages.map((m) => ({ ...m }));
    this.arguments = seedArguments.map((a) => this.deepCopyArgument(a));
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

  getUserByOAuthCode(code: string): User | undefined {
    const userId = this.oauthCodes.get(code);
    return userId ? this.users.get(userId) : undefined;
  }

  getParticipantsForRoom(roomId: string): RoomParticipant[] {
    return this.participants.filter((p) => p.roomId === roomId);
  }

  getMessagesForRoom(roomId: string, channel?: ChatChannel): Message[] {
    return this.messages
      .filter((m) => m.roomId === roomId && (!channel || m.channel === channel))
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
}

export const db = new MockDatabase();

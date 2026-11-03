import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ConnectSession, ConnectUser, QueueEntry } from './connect.types';

@Injectable()
export class ConnectStore {
  private readonly textQueue: QueueEntry[] = [];
  private readonly sessions = new Map<string, ConnectSession>();
  private readonly userToSession = new Map<string, string>();

  enqueue(user: ConnectUser): void {
    this.dequeue(user.userId);
    this.textQueue.push({ ...user, joinedAt: Date.now() });
  }

  dequeue(userId: string): boolean {
    const idx = this.textQueue.findIndex((u) => u.userId === userId);
    if (idx === -1) return false;
    this.textQueue.splice(idx, 1);
    return true;
  }

  tryMatch(initiator: ConnectUser): ConnectSession | null {
    const idx = this.textQueue.findIndex(
      (u) => u.userId !== initiator.userId && u.socketId !== initiator.socketId,
    );
    if (idx === -1) return null;
    const partner = this.textQueue.splice(idx, 1)[0];
    this.dequeue(initiator.userId);
    const session: ConnectSession = {
      id: randomUUID(),
      userA: initiator,
      userB: { userId: partner.userId, alias: partner.alias, socketId: partner.socketId },
      createdAt: Date.now(),
    };
    this.sessions.set(session.id, session);
    this.userToSession.set(session.userA.userId, session.id);
    this.userToSession.set(session.userB.userId, session.id);
    return session;
  }

  getSession(id: string): ConnectSession | undefined {
    return this.sessions.get(id);
  }

  getSessionForUser(userId: string): ConnectSession | undefined {
    const id = this.userToSession.get(userId);
    return id ? this.sessions.get(id) : undefined;
  }

  endSession(id: string): ConnectSession | undefined {
    const s = this.sessions.get(id);
    if (!s) return undefined;
    this.sessions.delete(id);
    this.userToSession.delete(s.userA.userId);
    this.userToSession.delete(s.userB.userId);
    return s;
  }
}

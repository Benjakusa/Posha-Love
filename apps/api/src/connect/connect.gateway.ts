import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ConnectStore } from './connect.store';
import type { ConnectUser } from './connect.types';

type JwtPayload = { sub: string; alias: string; role: string; ageLevel: string };

@WebSocketGateway({ namespace: '/connect', cors: { origin: '*' } })
export class ConnectGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ConnectGateway.name);

  constructor(
    private readonly store: ConnectStore,
    private readonly jwt: JwtService,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.headers.authorization?.replace('Bearer ', '') as string | undefined);
      if (!token) throw new Error('no token');
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      socket.data.user = {
        userId: payload.sub,
        alias: payload.alias,
        socketId: socket.id,
      } satisfies ConnectUser;
      this.logger.log(`connected ${payload.alias} (${socket.id})`);
    } catch {
      socket.emit('connect:error', { code: 'UNAUTHENTICATED' });
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket): void {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    this.store.dequeue(user.userId);
    const session = this.store.getSessionForUser(user.userId);
    if (session) {
      const other = session.userA.userId === user.userId ? session.userB : session.userA;
      this.server.to(other.socketId).emit('partner:offline', { lastSeen: Date.now() });
      this.server.to(other.socketId).emit('session:ended', { reason: 'partner_left' });
      this.store.endSession(session.id);
    }
  }

  @SubscribeMessage('connect:join')
  async onJoin(@ConnectedSocket() socket: Socket): Promise<void> {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    const matched = this.store.tryMatch(user);
    if (matched) {
      this.server.to(matched.userA.socketId).emit('session:matched', {
        sessionId: matched.id,
        partner: { alias: matched.userB.alias, online: true },
      });
      this.server.to(matched.userB.socketId).emit('session:matched', {
        sessionId: matched.id,
        partner: { alias: matched.userA.alias, online: true },
      });
    } else {
      this.store.enqueue(user);
      socket.emit('queue:waiting');
    }
  }

  @SubscribeMessage('connect:next')
  async onNext(@ConnectedSocket() socket: Socket): Promise<void> {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    const session = this.store.getSessionForUser(user.userId);
    if (session) {
      const other = session.userA.userId === user.userId ? session.userB : session.userA;
      this.server.to(other.socketId).emit('session:ended', { reason: 'partner_next' });
      this.store.endSession(session.id);
    }
    await this.onJoin(socket);
  }

  @SubscribeMessage('connect:leave')
  async onLeave(@ConnectedSocket() socket: Socket): Promise<void> {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    this.store.dequeue(user.userId);
    const session = this.store.getSessionForUser(user.userId);
    if (session) {
      const other = session.userA.userId === user.userId ? session.userB : session.userA;
      this.server.to(other.socketId).emit('session:ended', { reason: 'partner_left' });
      this.store.endSession(session.id);
    }
    socket.emit('queue:left');
  }

  @SubscribeMessage('message:send')
  async onMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { text?: string; clientId?: string },
  ): Promise<void> {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    const text = (body?.text ?? '').trim();
    if (!text || text.length > 1000) return;
    const session = this.store.getSessionForUser(user.userId);
    if (!session) return;
    const other = session.userA.userId === user.userId ? session.userB : session.userA;
    const ts = Date.now();
    const serverId = `${ts}-${Math.random().toString(36).slice(2, 8)}`;
    socket.emit('message:delivered', { clientId: body.clientId, serverId, ts });
    this.server.to(other.socketId).emit('message:receive', {
      from: user.alias, text, ts, serverId,
    });
  }

  @SubscribeMessage('message:read')
  async onRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { serverIds?: string[] },
  ): Promise<void> {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    const session = this.store.getSessionForUser(user.userId);
    if (!session) return;
    const other = session.userA.userId === user.userId ? session.userB : session.userA;
    this.server.to(other.socketId).emit('message:read', { serverIds: body?.serverIds ?? [] });
  }

  @SubscribeMessage('typing:start')
  async onTypingStart(@ConnectedSocket() socket: Socket): Promise<void> {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    const session = this.store.getSessionForUser(user.userId);
    if (!session) return;
    const other = session.userA.userId === user.userId ? session.userB : session.userA;
    this.server.to(other.socketId).emit('typing:start');
  }

  @SubscribeMessage('typing:stop')
  async onTypingStop(@ConnectedSocket() socket: Socket): Promise<void> {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    const session = this.store.getSessionForUser(user.userId);
    if (!session) return;
    const other = session.userA.userId === user.userId ? session.userB : session.userA;
    this.server.to(other.socketId).emit('typing:stop');
  }

  @SubscribeMessage('session:report')
  async onReport(@ConnectedSocket() socket: Socket): Promise<void> {
    const user = socket.data.user as ConnectUser | undefined;
    if (!user) return;
    const session = this.store.getSessionForUser(user.userId);
    this.logger.warn(`report from ${user.alias} session=${session?.id ?? 'none'}`);
    socket.emit('report:ack');
  }
}

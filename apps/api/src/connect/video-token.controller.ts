import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { randomBytes } from 'node:crypto';
import { GuestAuthGuard } from './guest-auth.guard';

type Principal = { userId: string; alias: string };

@Controller('connect')
@UseGuards(GuestAuthGuard)
export class VideoTokenController {
  private readonly roomService: RoomServiceClient | null = null;

  constructor(private readonly config: ConfigService) {
    const url = config.get<string>('LIVEKIT_URL');
    const key = config.get<string>('LIVEKIT_API_KEY');
    const secret = config.get<string>('LIVEKIT_API_SECRET');
    if (url && key && secret) {
      // LiveKit REST endpoint is https, not wss
      this.roomService = new RoomServiceClient(
        url.replace('wss://', 'https://'),
        key,
        secret,
      );
    }
  }

  @Post('video-token')
  async issue(
    @Request() req: { user: Principal },
    @Body() body: { sessionId?: string; partnerId?: string },
  ): Promise<{ wsUrl: string; token: string; roomName: string; expiresAt: string; maxSeconds: number }> {
    const url = this.config.get<string>('LIVEKIT_URL');
    const key = this.config.get<string>('LIVEKIT_API_KEY');
    const secret = this.config.get<string>('LIVEKIT_API_SECRET');
    if (!url || !key || !secret) {
      throw new BadRequestException({ code: 'LIVEKIT_NOT_CONFIGURED' });
    }
    if (!body?.sessionId || !body?.partnerId) {
      throw new BadRequestException({ code: 'VALIDATION_FAILED' });
    }

    const roomName = `posha-${body.sessionId}`;
    const ttlSeconds = 180; // token itself expires in 3 min — enough to join and get disconnected by our timer
    const at = new AccessToken(key, secret, {
      identity: req.user.userId,
      ttl: ttlSeconds,
      metadata: JSON.stringify({ alias: req.user.alias }),
    });
    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    const token = await at.toJwt();

    // Enforce guest 2-minute cap: schedule a disconnect for both participants.
    const maxSeconds = this.config.get<number>('GUEST_VIDEO_MAX_SECONDS', 120);
    if (this.roomService) {
      setTimeout(async () => {
        try {
          const participants = await this.roomService!.listParticipants(roomName);
          await Promise.all(
            participants.map((p) =>
              this.roomService!.removeParticipant(roomName, p.identity).catch(() => undefined),
            ),
          );
          await this.roomService!.deleteRoom(roomName).catch(() => undefined);
        } catch {
          /* room may already be gone */
        }
      }, maxSeconds * 1000);
    }

    return {
      wsUrl: url,
      token,
      roomName,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      maxSeconds,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import type { GuestSessionResponse } from '@posha/shared';

// Stage 1: in-memory guest store. Stage 2 will swap for Prisma.
@Injectable()
export class GuestService {
  private readonly issued = new Map<string, { alias: string; expiresAt: number }>();

  constructor(private readonly jwt: JwtService) {}

  async createSession(ttlSeconds: number): Promise<GuestSessionResponse> {
    const userId = `guest_${randomBytes(8).toString('hex')}`;
    const alias = `Guest${randomBytes(3).toString('hex')}`.toUpperCase();
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.issued.set(userId, { alias, expiresAt });

    const token = await this.jwt.signAsync(
      { sub: userId, role: 'guest', ageLevel: 'G1', alias },
      { expiresIn: `${ttlSeconds}s` },
    );

    return {
      token,
      expiresAt: new Date(expiresAt).toISOString(),
      alias,
      ageLevel: 'G1',
      role: 'guest',
    };
  }
}

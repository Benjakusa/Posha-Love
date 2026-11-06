import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { OtpStore } from './otp.store';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly otpStore: OtpStore,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async requestOtp(email: string, role: 'member' | 'creator'): Promise<{ ok: true }> {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new BadRequestException({ code: 'VALIDATION_FAILED', message: 'Invalid email' });
    }
    const code = this.otpStore.issue(email, role);
    this.logger.log(`[OTP] ${email} (${role}) → code: ${code}`);
    return { ok: true };
  }

  async verifyOtp(email: string, code: string): Promise<{
    token: string;
    alias: string;
    role: string;
    isNewUser: boolean;
    creatorStatus: 'approved' | 'pending' | 'rejected' | 'none';
  }> {
    const result = this.otpStore.verify(email, code);
    if (!result.ok) {
      throw new BadRequestException({ code: result.reason });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    let isNewUser = false;
    if (!user) {
      const alias = `User${randomBytes(3).toString('hex')}`.toUpperCase();
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          alias,
          role: result.role === 'creator' ? 'creator' : 'member',
          ageLevel: 'L2',
        },
      });
      isNewUser = true;
      this.logger.log(`[AUTH] created new user ${user.id} for ${normalizedEmail}`);
    } else {
      this.logger.log(`[AUTH] found existing user ${user.id} for ${normalizedEmail}`);
    }

    // Check if this user already has a creator profile or application
    let creatorStatus: 'approved' | 'pending' | 'rejected' | 'none' = 'none';
    const creator = await this.prisma.creator.findUnique({ where: { userId: user.id } });
    if (creator) {
      creatorStatus = creator.status as 'approved' | 'pending' | 'rejected';
    } else {
      const app = await this.prisma.creatorApplication.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      if (app) {
        creatorStatus = app.status as 'approved' | 'pending' | 'rejected';
      }
    }

    const token = await this.jwt.signAsync(
      { sub: user.id, role: result.role, ageLevel: 'L2', alias: user.alias },
      { expiresIn: '30d' },
    );
    return { token, alias: user.alias, role: result.role, isNewUser, creatorStatus };
  }
}

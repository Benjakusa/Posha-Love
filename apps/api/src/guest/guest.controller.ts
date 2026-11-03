import { Body, Controller, HttpCode, Post, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GuestSessionRequest } from '@posha/shared';
import { GuestService } from './guest.service';

@Controller('guest')
export class GuestController {
  constructor(
    private readonly guest: GuestService,
    private readonly config: ConfigService,
  ) {}

  @Post('session')
  @HttpCode(201)
  async createSession(@Body() body: unknown) {
    const parsed = GuestSessionRequest.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'ageDeclaration must be true',
      });
    }
    const ttl = this.config.get<number>('GUEST_SESSION_TTL_SECONDS', 4 * 60 * 60);
    return this.guest.createSession(ttl);
  }
}

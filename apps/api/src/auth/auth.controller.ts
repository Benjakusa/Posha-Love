import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('otp/request')
  async request(@Body() body: { email?: string; role?: 'member' | 'creator' }) {
    const role = body?.role === 'creator' ? 'creator' : 'member';
    return this.auth.requestOtp(body?.email ?? '', role);
  }

  @Post('otp/verify')
  async verify(@Body() body: { email?: string; code?: string }) {
    return this.auth.verifyOtp(body?.email ?? '', body?.code ?? '');
  }
}

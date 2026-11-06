import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { GuestAuthGuard } from '../connect/guest-auth.guard';
import { RolesGuard } from '../connect/roles.guard';
import { Roles } from '../connect/roles.decorator';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(GuestAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subs: SubscriptionsService) {}

  @Post('checkout')
  @Roles('member', 'creator', 'admin')
  async checkout(@Request() req: any, @Body() body: { creatorId: string; amountMinor: number }) {
    return this.subs.checkout(req.user.userId, body.creatorId, body.amountMinor);
  }

  @Post('fake-pay')
  @Roles('member', 'creator', 'admin')
  async fakePay(@Request() req: any, @Body() body: { paymentId: string }) {
    return this.subs.fakePay(req.user.userId, body.paymentId);
  }

  @Get('me')
  @Roles('member', 'creator', 'admin')
  async me(@Request() req: any) {
    return this.subs.listMine(req.user.userId);
  }

  @Get('entitlements')
  @Roles('guest', 'member', 'creator', 'admin')
  async entitlements(@Request() req: any) {
    if (req.user.role === 'guest') return [];
    return this.subs.listEntitlements(req.user.userId);
  }
}

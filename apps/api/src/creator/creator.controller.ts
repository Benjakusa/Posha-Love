import { Controller, Post, Get, Patch, Body, UseGuards, Request, HttpCode, Param } from '@nestjs/common';
import { GuestAuthGuard } from '../connect/guest-auth.guard';
import { RolesGuard } from '../connect/roles.guard';
import { Roles } from '../connect/roles.decorator';
import { CreatorService } from './creator.service';

@Controller('creator')
@UseGuards(GuestAuthGuard, RolesGuard)
export class CreatorController {
  constructor(private readonly creator: CreatorService) {}

  @Post('presign-avatar')
  @HttpCode(200)
  @Roles('member', 'creator', 'admin')
  async presign(@Request() req: any, @Body() body: { contentType: string }) {
    try {
      return await this.creator.presignAvatar(req.user.userId, body.contentType);
    } catch {
      return { uploadUrl: null, key: null, publicUrl: null, reason: 'R2_NOT_CONFIGURED' };
    }
  }

  @Post('presign-image')
  @HttpCode(200)
  @Roles('member', 'creator', 'admin')
  async presignImage(@Request() req: any, @Body() body: { kind: 'avatar' | 'cover'; contentType: string }) {
    if (!['avatar', 'cover'].includes(body.kind)) {
      return { error: 'INVALID_IMAGE_KIND' };
    }
    return this.creator.presignImage(req.user.userId, body.kind, body.contentType);
  }

  @Post('apply')
  @Roles('member', 'creator', 'admin')
  async apply(@Request() req: any, @Body() body: any) {
    return this.creator.apply(req.user.userId, body);
  }

  @Patch('profile')
  @Roles('member', 'creator', 'admin')
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.creator.updateProfile(req.user.userId, body);
  }

  @Get('me')
  @Roles('member', 'creator', 'admin')
  async me(@Request() req: any) {
    return this.creator.me(req.user.userId);
  }

  @Get('stats')
  @Roles('creator', 'admin')
  async stats(@Request() req: any) {
    return this.creator.dashboardStats(req.user.userId);
  }

  @Post('posts')
  @Roles('creator', 'admin')
  async createPost(@Request() req: any, @Body() body: { caption: string; mediaKey: string; mediaType: 'image' | 'video' }) {
    return this.creator.createPost(req.user.userId, body);
  }

  @Post('lives')
  @Roles('creator', 'admin')
  async scheduleLive(@Request() req: any, @Body() body: { title: string; startsAt: string }) {
    return this.creator.scheduleLive(req.user.userId, body);
  }
}

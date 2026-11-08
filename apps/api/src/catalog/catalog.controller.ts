import { Controller, Get, Post, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { GuestAuthGuard } from '../connect/guest-auth.guard';
import { OptionalAuthGuard } from '../connect/optional-auth.guard';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('creators')
  creators(@Query() q: any) {
    return this.catalog.creators({
      q: q.q || undefined,
      gender: q.gender || undefined,
      ethnicity: q.ethnicity || undefined,
      orientation: q.orientation || undefined,
      ageMin: q.ageMin ? Number(q.ageMin) : undefined,
      ageMax: q.ageMax ? Number(q.ageMax) : undefined,
    });
  }

  @Get('creator/:handle')
  @UseGuards(OptionalAuthGuard)
  creatorProfile(@Param('handle') handle: string, @Request() req: any) {
    return this.catalog.creatorProfile(handle, req.user?.userId);
  }

  @Get('lives')
  lives() { return this.catalog.lives(); }

  @Get('feed')
  @UseGuards(GuestAuthGuard)
  feed(@Request() req: any, @Query() q: any) {
    return this.catalog.feed(req.user?.userId, {
      q: q.q || undefined,
      gender: q.gender || undefined,
      ethnicity: q.ethnicity || undefined,
      orientation: q.orientation || undefined,
      ageMin: q.ageMin ? Number(q.ageMin) : undefined,
      ageMax: q.ageMax ? Number(q.ageMax) : undefined,
    });
  }

  @Post('posts/:id/like')
  @UseGuards(GuestAuthGuard)
  toggleLike(@Param('id') postId: string, @Request() req: any) {
    return this.catalog.toggleLike(postId, req.user.userId);
  }

  @Post('posts/:id/comments')
  @UseGuards(GuestAuthGuard)
  addComment(@Param('id') postId: string, @Body() body: { text: string; parentId?: string }, @Request() req: any) {
    return this.catalog.addComment(postId, req.user.userId, req.user.alias, body.text, body.parentId);
  }

  @Post('comments/:id/like')
  @UseGuards(GuestAuthGuard)
  toggleCommentLike(@Param('id') commentId: string, @Request() req: any) {
    return this.catalog.toggleCommentLike(commentId, req.user.userId);
  }
}

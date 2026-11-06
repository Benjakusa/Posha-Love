import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';

@Injectable()
export class CreatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  async presignAvatar(userId: string, contentType: string) {
    if (!['image/jpeg', 'image/png'].includes(contentType)) {
      throw new BadRequestException({ code: 'VALIDATION_FAILED', message: 'Only JPEG/PNG' });
    }
    return this.r2.presignAvatar(userId, contentType);
  }

  async presignImage(userId: string, kind: 'avatar' | 'cover', contentType: string) {
    if (!['image/jpeg', 'image/png'].includes(contentType)) {
      throw new BadRequestException({ code: 'VALIDATION_FAILED', message: 'Only JPEG/PNG' });
    }
    return this.r2.presignCreatorImage(userId, kind, contentType);
  }

  async apply(userId: string, body: {
    displayName: string; handle: string; bio?: string; avatarKey?: string;
    coverKey?: string; subscriptionPriceMinor: number; rulesAccepted: boolean;
  }) {
    if (!body.rulesAccepted) throw new BadRequestException({ code: 'RULES_REQUIRED' });
    if (body.subscriptionPriceMinor < 10000) throw new BadRequestException({ code: 'PRICE_TOO_LOW' });

    for (const [kind, key] of [['avatar', body.avatarKey], ['cover', body.coverKey]] as const) {
      if (key && !this.r2.ownsCreatorImageKey(userId, key, kind)) {
        throw new BadRequestException({ code: 'INVALID_IMAGE_KEY' });
      }
    }

    const existingHandle = await this.prisma.creator.findUnique({ where: { handle: body.handle } });
    if (existingHandle && existingHandle.userId !== userId) {
      throw new ConflictException({ code: 'HANDLE_TAKEN' });
    }

    console.log('[APPLY] creating userId=', userId, 'handle=', body.handle);
    try {
      // 1. Record the application (audit trail)
      const app = await this.prisma.creatorApplication.create({
        data: {
          userId,
          displayName: body.displayName,
          handle: body.handle,
          bio: body.bio ?? null,
          avatarKey: body.avatarKey ?? null,
          coverKey: body.coverKey ?? null,
          subscriptionPriceMinor: body.subscriptionPriceMinor,
          rulesAccepted: true,
          status: 'approved',
        },
      });

      // 2. Immediately create the Creator row (no admin approval)
      const creator = await this.prisma.creator.upsert({
        where: { userId },
        create: {
          userId,
          displayName: body.displayName,
          handle: body.handle,
          bio: body.bio ?? null,
          avatarKey: body.avatarKey ?? null,
          coverKey: body.coverKey ?? null,
          subscriptionPriceMinor: body.subscriptionPriceMinor,
          status: 'approved',
        },
        update: {
          displayName: body.displayName,
          handle: body.handle,
          bio: body.bio ?? null,
          avatarKey: body.avatarKey ?? null,
          coverKey: body.coverKey ?? null,
          subscriptionPriceMinor: body.subscriptionPriceMinor,
          status: 'approved',
        },
      });

      console.log('[APPLY] SUCCESS app id=', app.id, 'creator id=', creator.id, 'status=approved');
      return { status: 'approved' };
    } catch (e: any) {
      console.error('[APPLY] FAILED:', e?.message ?? String(e));
      throw e;
    }
  }

  async updateProfile(userId: string, body: {
    displayName?: string;
    handle?: string;
    bio?: string | null;
    avatarKey?: string | null;
    coverKey?: string | null;
    subscriptionPriceMinor?: number;
    category?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    xHandle?: string | null;
    publicProfile?: boolean;
    showVideos?: boolean;
    showLives?: boolean;
  }) {
    const creator = await this.prisma.creator.findUnique({ where: { userId } });
    if (!creator) throw new BadRequestException({ code: "CREATOR_NOT_FOUND" });

    const displayName = body.displayName?.trim() ?? creator.displayName;
    const handle = body.handle?.trim().toLowerCase() ?? creator.handle;
    const bio = body.bio === undefined ? creator.bio : body.bio?.trim() || null;
    const price = body.subscriptionPriceMinor ?? creator.subscriptionPriceMinor;

    if (displayName.length < 2 || displayName.length > 40) {
      throw new BadRequestException({ code: "INVALID_DISPLAY_NAME" });
    }
    if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
      throw new BadRequestException({ code: "INVALID_HANDLE" });
    }
    if (bio && bio.length > 200) {
      throw new BadRequestException({ code: "BIO_TOO_LONG" });
    }
    if (!Number.isInteger(price) || price < 10000) {
      throw new BadRequestException({ code: "PRICE_TOO_LOW" });
    }

    const existingHandle = await this.prisma.creator.findUnique({ where: { handle } });
    if (existingHandle && existingHandle.userId !== userId) {
      throw new ConflictException({ code: "HANDLE_TAKEN" });
    }

    for (const [kind, key] of [["avatar", body.avatarKey], ["cover", body.coverKey]] as const) {
      if (key !== undefined && key !== null && !this.r2.ownsCreatorImageKey(userId, key, kind)) {
        throw new BadRequestException({ code: "INVALID_IMAGE_KEY" });
      }
    }

    const updated = await this.prisma.creator.update({
      where: { userId },
      data: {
        displayName,
        handle,
        bio,
        subscriptionPriceMinor: price,
        ...(body.avatarKey !== undefined ? { avatarKey: body.avatarKey } : {}),
        ...(body.coverKey !== undefined ? { coverKey: body.coverKey } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.instagram !== undefined ? { instagram: body.instagram } : {}),
        ...(body.tiktok !== undefined ? { tiktok: body.tiktok } : {}),
        ...(body.youtube !== undefined ? { youtube: body.youtube } : {}),
        ...(body.xHandle !== undefined ? { xHandle: body.xHandle } : {}),
        ...(body.publicProfile !== undefined ? { publicProfile: body.publicProfile } : {}),
        ...(body.showVideos !== undefined ? { showVideos: body.showVideos } : {}),
        ...(body.showLives !== undefined ? { showLives: body.showLives } : {}),
      },
    });

    return {
      status: updated.status,
      profile: {
        id: updated.id,
        displayName: updated.displayName,
        handle: updated.handle,
        bio: updated.bio,
        avatarKey: updated.avatarKey,
        coverKey: updated.coverKey,
        avatarUrl: updated.avatarKey ? await this.r2.getSignedImageUrl(updated.avatarKey) : null,
        coverUrl: updated.coverKey ? await this.r2.getSignedImageUrl(updated.coverKey) : null,
        category: updated.category,
        instagram: updated.instagram,
        tiktok: updated.tiktok,
        youtube: updated.youtube,
        xHandle: updated.xHandle,
        publicProfile: updated.publicProfile,
        showVideos: updated.showVideos,
        showLives: updated.showLives,
        subscriptionPriceMinor: updated.subscriptionPriceMinor,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  }

  async me(userId: string) {
    const creator = await this.prisma.creator.findUnique({ where: { userId } });
    if (!creator) {
      const app = await this.prisma.creatorApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (app) {
        return {
          status: 'pending',
          application: {
            displayName: app.displayName,
            handle: app.handle,
            bio: app.bio,
            avatarKey: app.avatarKey,
            coverKey: app.coverKey,
            avatarUrl: app.avatarKey ? await this.r2.getSignedImageUrl(app.avatarKey) : null,
            coverUrl: app.coverKey ? await this.r2.getSignedImageUrl(app.coverKey) : null,
            subscriptionPriceMinor: app.subscriptionPriceMinor,
            submittedAt: app.createdAt.toISOString(),
          },
          profile: null,
          content: { videos: [], lives: [] },
          stats: { subscribers: 0, earningsMinor: 0, videos: 0, scheduledLives: 0 },
        };
      }
      return null;
    }

    const subscribers = await this.prisma.subscription.count({
      where: { creatorId: creator.userId, status: 'active' },
    });

    return {
      status: creator.status,
      application: null,
      profile: {
        id: creator.id,
        displayName: creator.displayName,
        handle: creator.handle,
        bio: creator.bio,
        avatarKey: creator.avatarKey,
        coverKey: creator.coverKey,
        avatarUrl: creator.avatarKey ? await this.r2.getSignedImageUrl(creator.avatarKey) : null,
        coverUrl: creator.coverKey ? await this.r2.getSignedImageUrl(creator.coverKey) : null,
        category: creator.category,
        instagram: creator.instagram,
        tiktok: creator.tiktok,
        youtube: creator.youtube,
        xHandle: creator.xHandle,
        publicProfile: creator.publicProfile,
        showVideos: creator.showVideos,
        showLives: creator.showLives,
        subscriptionPriceMinor: creator.subscriptionPriceMinor,
        createdAt: creator.createdAt.toISOString(),
      },
      content: { videos: [], lives: [] },
      stats: {
        subscribers,
        earningsMinor: 0,
        videos: 0,
        scheduledLives: 0,
      },
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async creators(filters?: {
    q?: string; gender?: string; ethnicity?: string;
    orientation?: string; ageMin?: number; ageMax?: number;
  }) {
    const where: any = { status: 'approved', publicProfile: true };
    if (filters?.q) {
      where.OR = [
        { displayName: { contains: filters.q, mode: 'insensitive' } },
        { handle: { contains: filters.q, mode: 'insensitive' } },
        { bio: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    if (filters?.gender) where.gender = filters.gender;
    if (filters?.ethnicity) where.ethnicity = filters.ethnicity;
    if (filters?.orientation) where.orientation = filters.orientation;
    if (filters?.ageMin != null) where.ageMax = { gte: filters.ageMin };
    if (filters?.ageMax != null) where.ageMin = { lte: filters.ageMax };

    const rows = await this.prisma.creator.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: {
        id: true, userId: true, handle: true, displayName: true, bio: true,
        avatarKey: true, coverKey: true, gender: true, ethnicity: true, categories: true, languages: true, country: true,
        orientation: true, ageMin: true, ageMax: true,
        subscriptionPriceMinor: true,
      },
    });
    return Promise.all(rows.map(async (c) => ({
      id: c.id, userId: c.userId, handle: c.handle,
      displayName: c.displayName, bio: c.bio,
      gender: c.gender, ethnicity: c.ethnicity, orientation: c.orientation, categories: c.categories, languages: c.languages, country: c.country,
      ageMin: c.ageMin, ageMax: c.ageMax,
      avatarUrl: c.avatarKey ? this.publicUrl(c.avatarKey) : null,
      coverUrl: c.coverKey ? this.publicUrl(c.coverKey) : null,
      subscriptionPriceMinor: c.subscriptionPriceMinor,
    })));
  }

  async creatorProfile(handle: string, viewerId?: string) {
    const creator = await this.prisma.creator.findUnique({ where: { handle } });
    if (!creator) throw new NotFoundException({ code: 'CREATOR_NOT_FOUND' });

    const [posts, live, subscribed] = await Promise.all([
      this.prisma.post.findMany({
        where: { creatorId: creator.userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: { comments: { orderBy: { createdAt: 'asc' } } },
      }),
      this.prisma.scheduledLive.findMany({
        where: { creatorId: creator.userId },
        orderBy: { startsAt: 'asc' },
        take: 10,
      }),
      viewerId
        ? this.prisma.subscription.findFirst({
            where: { subscriberId: viewerId, creatorId: creator.userId, status: 'active', currentPeriodEnd: { gt: new Date() } },
          }).then(Boolean)
        : Promise.resolve(false),
    ]);

    const postIds = posts.map((p) => p.id);
    const likes = postIds.length
      ? await this.prisma.like.groupBy({ by: ['postId'], where: { postId: { in: postIds } }, _count: { postId: true } })
      : [];
    const likeCounts = new Map(likes.map((l) => [l.postId, l._count.postId]));

    return {
      profile: {
        id: creator.id,
        userId: creator.userId,
        handle: creator.handle,
        displayName: creator.displayName,
        bio: creator.bio,
        gender: creator.gender,
        ethnicity: creator.ethnicity,
        categories: creator.categories,
        languages: creator.languages,
        country: creator.country,
        orientation: creator.orientation,
        ageMin: creator.ageMin,
        ageMax: creator.ageMax,
        avatarUrl: creator.avatarKey ? this.publicUrl(creator.avatarKey) : null,
        coverUrl: creator.coverKey ? this.publicUrl(creator.coverKey) : null,
        subscriptionPriceMinor: creator.subscriptionPriceMinor,
      },
      subscribed,
      posts: posts.map((p) => ({
        id: p.id,
        caption: p.caption,
        mediaType: p.mediaType,
        // GATE: locked posts don't expose the real media URL to non-subscribers
        mediaUrl: subscribed ? this.publicUrl(p.mediaKey) : null,
        lockedMediaKey: subscribed ? null : p.mediaKey,
        createdAt: p.createdAt.toISOString(),
        likeCount: likeCounts.get(p.id) ?? 0,
        comments: p.comments.map((c) => ({
          id: c.id, parentId: c.parentId, text: c.text,
          authorAlias: c.authorAlias, createdAt: c.createdAt.toISOString(),
        })),
      })),
      lives: live.map((l) => ({
        id: l.id, title: l.title, startsAt: l.startsAt.toISOString(), status: l.status,
      })),
    };
  }

  async lives() {
    const rows = await this.prisma.scheduledLive.findMany({ orderBy: { startsAt: 'asc' }, take: 10 });
    const creatorUserIds = [...new Set(rows.map((l) => l.creatorId))];
    const creators = await this.prisma.creator.findMany({ where: { userId: { in: creatorUserIds } } });
    const map = new Map(creators.map((c) => [c.userId, c]));
    return rows.map((l) => {
      const c = map.get(l.creatorId);
      return {
        id: l.id, title: l.title, startsAt: l.startsAt.toISOString(), status: l.status,
        creator: c ? {
          handle: c.handle, displayName: c.displayName,
          avatarUrl: c.avatarKey ? this.publicUrl(c.avatarKey) : null,
        } : null,
      };
    });
  }

  async feed(userId?: string, filters?: {
    q?: string; gender?: string; ethnicity?: string;
    orientation?: string; ageMin?: number; ageMax?: number;
  }) {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    const creatorUserIds = [...new Set(posts.map((p) => p.creatorId))];
    const creators = await this.prisma.creator.findMany({ where: { userId: { in: creatorUserIds } } });
    let filteredCreators = creators;
    if (filters) {
      filteredCreators = creators.filter((c) => {
        if (filters.q) {
          const q = filters.q.toLowerCase();
          const hit = c.handle.toLowerCase().includes(q) || c.displayName.toLowerCase().includes(q);
          if (!hit) return false;
        }
        if (filters.gender && c.gender !== filters.gender) return false;
        if (filters.ethnicity && c.ethnicity !== filters.ethnicity) return false;
        if (filters.orientation && c.orientation !== filters.orientation) return false;
        if (filters.ageMin != null && (c.ageMax ?? 0) < filters.ageMin) return false;
        if (filters.ageMax != null && (c.ageMin ?? 99) > filters.ageMax) return false;
        return true;
      });
    }
    const allowedUserIds = new Set(filteredCreators.map((c) => c.userId));
    const filteredPosts = filters ? posts.filter((p) => allowedUserIds.has(p.creatorId)) : posts;
    const map = new Map(creators.map((c) => [c.userId, c]));

    const postIds = filteredPosts.map((p) => p.id);
    const commentIds = posts.flatMap((p) => p.comments.map((c) => c.id));

    const [likes, myLikes, cmtLikes, myCmtLikes] = await Promise.all([
      postIds.length ? this.prisma.like.groupBy({ by: ['postId'], where: { postId: { in: postIds } }, _count: { postId: true } }) : [],
      userId && postIds.length ? this.prisma.like.findMany({ where: { postId: { in: postIds }, userId }, select: { postId: true } }) : [],
      commentIds.length ? this.prisma.commentLike.groupBy({ by: ['commentId'], where: { commentId: { in: commentIds } }, _count: { commentId: true } }) : [],
      userId && commentIds.length ? this.prisma.commentLike.findMany({ where: { commentId: { in: commentIds }, userId }, select: { commentId: true } }) : [],
    ]);

    const likeCounts = new Map(likes.map((l) => [l.postId, l._count.postId]));
    const likedSet = new Set(myLikes.map((l) => l.postId));
    const cmtLikeCounts = new Map(cmtLikes.map((l) => [l.commentId, l._count.commentId]));
    const cmtLikedSet = new Set(myCmtLikes.map((l) => l.commentId));

    return filteredPosts.map((p) => {
      const c = map.get(p.creatorId);
      return {
        id: p.id,
        caption: p.caption,
        mediaType: p.mediaType,
        mediaUrl: this.publicUrl(p.mediaKey),
        createdAt: p.createdAt.toISOString(),
        creator: c ? {
          id: c.userId, handle: c.handle, displayName: c.displayName,
          avatarUrl: c.avatarKey ? this.publicUrl(c.avatarKey) : null,
          subscriptionPriceMinor: c.subscriptionPriceMinor,
        } : null,
        likeCount: likeCounts.get(p.id) ?? 0,
        likedByMe: likedSet.has(p.id),
        comments: p.comments.map((cm) => ({
          id: cm.id, parentId: cm.parentId, text: cm.text,
          authorAlias: cm.authorAlias, createdAt: cm.createdAt.toISOString(),
          likeCount: cmtLikeCounts.get(cm.id) ?? 0,
          likedByMe: cmtLikedSet.has(cm.id),
        })),
      };
    });
  }

  async toggleLike(postId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({ where: { postId_userId: { postId, userId } } });
    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.prisma.like.create({ data: { postId, userId } });
    return { liked: true };
  }

  async toggleCommentLike(commentId: string, userId: string) {
    const existing = await this.prisma.commentLike.findUnique({ where: { commentId_userId: { commentId, userId } } });
    if (existing) {
      await this.prisma.commentLike.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.prisma.commentLike.create({ data: { commentId, userId } });
    return { liked: true };
  }

  async addComment(postId: string, authorId: string, authorAlias: string, text: string, parentId?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException({ code: 'POST_NOT_FOUND' });
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 500) throw new BadRequestException({ code: 'INVALID_COMMENT' });
    const cm = await this.prisma.comment.create({
      data: { postId, parentId: parentId ?? null, authorId, authorAlias, text: trimmed },
    });
    return {
      id: cm.id, parentId: cm.parentId, text: cm.text,
      authorAlias: cm.authorAlias, createdAt: cm.createdAt.toISOString(),
      likeCount: 0, likedByMe: false,
    };
  }

  private publicUrl(key: string): string {
    if (!key) return '';
    if (key.startsWith('http://') || key.startsWith('https://')) return key;
    const base = process.env.R2_PUBLIC_URL ?? '';
    return base ? `${base}/${key.replace(/^\//, '')}` : key;
  }
}

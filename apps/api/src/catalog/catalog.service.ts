import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async creators() {
    const rows = await this.prisma.creator.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        handle: true,
        displayName: true,
        bio: true,
        avatarKey: true,
        subscriptionPriceMinor: true,
      },
    });
    return rows.map((c) => ({
      id: c.id,
      handle: c.handle,
      displayName: c.displayName,
      bio: c.bio,
      avatarKey: c.avatarKey,
      priceMinor: c.subscriptionPriceMinor,
    }));
  }
}

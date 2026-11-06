import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a checkout (fake provider). Idempotency key = subscriber+creator+period. */
  async checkout(userId: string, creatorId: string, amountMinor: number) {
    const idempotencyKey = `sub:${userId}:${creatorId}`;
    const existing = await this.prisma.payment.findUnique({ where: { idempotencyKey } });
    if (existing && existing.status === 'succeeded') {
      return { paymentId: existing.id, status: 'succeeded' as const };
    }
    if (existing) {
      return { paymentId: existing.id, status: existing.status as any };
    }
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        creatorId,
        provider: 'fake',
        idempotencyKey,
        amountMinor,
        currency: 'KES',
        status: 'pending',
        purpose: 'subscription',
      },
    });
    return { paymentId: payment.id, status: 'pending' as const };
  }

  /** Dev-only: simulate the provider webhook. Idempotent. */
  async fakePay(userId: string, paymentId: string) {
    return this.prisma.forUser(userId, async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id: paymentId, userId },
      });
      if (!payment) throw new NotFoundException({ code: 'PAYMENT_NOT_FOUND' });
      if (payment.status === 'succeeded') {
        const sub = await tx.subscription.findFirst({
          where: { subscriberId: userId, creatorId: payment.creatorId ?? '' },
        });
        return { ok: true, subscriptionId: sub?.id ?? null, alreadyProcessed: true };
      }
      if (!payment.creatorId) throw new BadRequestException({ code: 'MISSING_CREATOR' });

      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'succeeded', providerRef: `fake_${randomUUID()}` },
      });

      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const sub = await tx.subscription.upsert({
        where: { subscriberId_creatorId: { subscriberId: userId, creatorId: payment.creatorId } },
        create: {
          subscriberId: userId,
          creatorId: payment.creatorId,
          status: 'active',
          currentPeriodEnd: periodEnd,
        },
        update: {
          status: 'active',
          currentPeriodEnd: periodEnd,
        },
      });
      return { ok: true, subscriptionId: sub.id };
    });
  }

  async listMine(userId: string) {
    return this.prisma.forUser(userId, async (tx) => {
      const subs = await tx.subscription.findMany({
        where: { subscriberId: userId },
        orderBy: { createdAt: 'desc' },
      });
      return subs.map((s) => ({
        id: s.id,
        creatorId: s.creatorId,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd.toISOString(),
      }));
    });
  }

  async isEntitled(userId: string, creatorId: string): Promise<boolean> {
    const now = new Date();
    const sub = await this.prisma.subscription.findFirst({
      where: { subscriberId: userId, creatorId, status: 'active', currentPeriodEnd: { gt: now } },
    });
    return !!sub;
  }

  async listEntitlements(userId: string): Promise<string[]> {
    const now = new Date();
    const subs = await this.prisma.subscription.findMany({
      where: { subscriberId: userId, status: 'active', currentPeriodEnd: { gt: now } },
      select: { creatorId: true },
    });
    return subs.map((s) => s.creatorId);
  }
}

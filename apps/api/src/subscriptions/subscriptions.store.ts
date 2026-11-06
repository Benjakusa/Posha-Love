import { Injectable } from '@nestjs/common';

type Subscription = {
  id: string;
  userId: string;
  creatorAlias: string;
  plan: string;
  priceMinor: number;
  currency: string;
  status: 'active' | 'expired';
  createdAt: number;
  expiresAt: number;
};

@Injectable()
export class SubscriptionsStore {
  private readonly byUser = new Map<string, Subscription[]>();

  create(userId: string, creatorAlias: string, plan: string, priceMinor: number, currency = 'KES'): Subscription {
    const now = Date.now();
    const sub: Subscription = {
      id: `sub_${now}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      creatorAlias,
      plan,
      priceMinor,
      currency,
      status: 'active',
      createdAt: now,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000,
    };
    const list = this.byUser.get(userId) ?? [];
    list.push(sub);
    this.byUser.set(userId, list);
    return sub;
  }

  listForUser(userId: string): Subscription[] {
    return this.byUser.get(userId) ?? [];
  }

  isSubscribed(userId: string, creatorAlias: string): boolean {
    const list = this.byUser.get(userId) ?? [];
    return list.some((s) => s.creatorAlias === creatorAlias && s.status === 'active' && s.expiresAt > Date.now());
  }
}

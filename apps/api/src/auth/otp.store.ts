import { Injectable } from '@nestjs/common';
import { randomInt, createHmac, timingSafeEqual } from 'node:crypto';

type OtpRecord = {
  email: string;
  digest: string;      // HMAC of the code
  expiresAt: number;
  attempts: number;
  role: 'member' | 'creator';
};

@Injectable()
export class OtpStore {
  private readonly records = new Map<string, OtpRecord>();
  private readonly secret = process.env.JWT_SECRET ?? 'dev-otp-secret';
  private readonly maxAttempts = 5;
  private readonly ttlMs = 10 * 60 * 1000; // 10 min

  issue(email: string, role: 'member' | 'creator'): string {
    const code = String(randomInt(100000, 999999));
    const digest = this.hash(code);
    this.records.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      digest,
      expiresAt: Date.now() + this.ttlMs,
      attempts: 0,
      role,
    });
    return code;
  }

  verify(email: string, code: string): { ok: true; role: 'member' | 'creator' } | { ok: false; reason: string } {
    const key = email.toLowerCase();
    const rec = this.records.get(key);
    if (!rec) return { ok: false, reason: 'NO_OTP' };
    if (Date.now() > rec.expiresAt) {
      this.records.delete(key);
      return { ok: false, reason: 'EXPIRED' };
    }
    if (rec.attempts >= this.maxAttempts) return { ok: false, reason: 'LOCKED' };

    const candidate = this.hash(code);
    const a = Buffer.from(candidate, 'hex');
    const b = Buffer.from(rec.digest, 'hex');
    const ok = a.length === b.length && timingSafeEqual(a, b);

    if (!ok) {
      rec.attempts += 1;
      return { ok: false, reason: 'INVALID' };
    }

    this.records.delete(key);
    return { ok: true, role: rec.role };
  }

  private hash(code: string): string {
    return createHmac('sha256', this.secret).update(code).digest('hex');
  }
}

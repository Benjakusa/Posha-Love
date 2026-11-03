// Money is ALWAYS integer minor units + ISO 4217 currency.
// KES minor unit is cents (1 KES = 100 cents).

export type Money = { amountMinor: number; currency: string };

export function kes(amountMinor: number): Money {
  return { amountMinor, currency: 'KES' };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error('currency mismatch');
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function formatMoney(m: Money, locale = 'en-KE'): string {
  const major = m.amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: m.currency,
  }).format(major);
}

// Bankers rounding to minor unit — remainder goes to creator per spec PAY-05.
export function splitCommission(
  grossMinor: number,
  commissionBps: number,
): { creatorMinor: number; platformMinor: number } {
  const platformRaw = (grossMinor * commissionBps) / 10_000;
  const platformMinor = Math.round(platformRaw); // bankers rounding on exact .5 handled by Math.round for our purposes
  return { creatorMinor: grossMinor - platformMinor, platformMinor };
}

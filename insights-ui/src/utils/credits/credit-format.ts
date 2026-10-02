import { CENTS_PER_CREDIT } from '@/types/credits';

/** `September 2, 2026` — the single date shown as "Report generated on …". */
export function formatReportGeneratedDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** `Sep 2, 2026` — compact date for badges and history rows. */
export function formatShortDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** `today` / `yesterday` / `47 days ago` — how old a report is, next to its date. */
export function formatReportAge(value: string | Date | null | undefined, now: number): string | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  // Calendar days, not 24h blocks: 23:30 yesterday viewed at 08:00 today is "yesterday".
  // Math.round absorbs the 23h/25h days around DST changes.
  const startOfDay = (t: number) => new Date(t).setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.round((startOfDay(now) - startOfDay(time)) / (24 * 60 * 60 * 1000)));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

/** `$10.00` from an amount in USD cents. */
export function formatUsd(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountInCents / 100);
}

/** `1 credit` / `10 credits`. */
export function formatCredits(credits: number): string {
  return `${credits} ${Math.abs(credits) === 1 ? 'credit' : 'credits'}`;
}

/** `1 report` / `10 reports`. */
export function formatReports(credits: number): string {
  return `${credits} ${Math.abs(credits) === 1 ? 'report' : 'reports'}`;
}

/** `10 reports · $1.00 each` — the per-pack value line. */
export function formatPackDetail(credits: number): string {
  return `${credits} ${credits === 1 ? 'report' : 'reports'} · ${formatUsd(CENTS_PER_CREDIT)} each`;
}

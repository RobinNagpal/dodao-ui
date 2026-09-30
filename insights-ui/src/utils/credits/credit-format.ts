import { CENTS_PER_CREDIT } from '@/types/credits';

/** `September 2, 2026` — the single date shown as "Report generated on …". */
export function formatReportGeneratedDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

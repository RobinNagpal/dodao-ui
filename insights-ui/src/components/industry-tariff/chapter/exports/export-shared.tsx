import { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import type { TariffExportMarketStatus } from '@/types/tariff-chapter-exports';

// Formatting shared by the three export pages of a chapter report.

export function usd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function change(pct: number | null): string | null {
  if (pct === null) return null;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

/** A share bar's length, scaled so the largest row in its table fills the track. */
export function barWidth(sharePct: number, maxSharePct: number): number {
  return maxSharePct > 0 ? (sharePct / maxSharePct) * 100 : 0;
}

export const EXPORT_STATUS_BADGE: Record<TariffExportMarketStatus, { variant: StatusBadgeVariant; label: string }> = {
  unchanged: { variant: 'neutral', label: 'No change' },
  lowered: { variant: 'success', label: 'Tariff lowered' },
  raised: { variant: 'danger', label: 'Tariff raised' },
  raisedThenRemoved: { variant: 'warning', label: 'Raised, then removed' },
  pending: { variant: 'info', label: 'Change pending' },
};

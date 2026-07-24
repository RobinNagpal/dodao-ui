import { EtfListingResponse, EtfListingItem } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import { formatPercentageDecimal } from '@/components/reportsv1/financialFormatters';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import EtfScoreBadge from '@/components/ui/badges/EtfScoreBadge';
import { getEtfGroupKey } from '@/utils/etf-categorization-utils';
import Link from 'next/link';
import React, { use } from 'react';
import EtfPagination from './EtfPagination';

function parseNumericString(value: string | null): number | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, '').replace(/^\$/, '').trim();
  const match = cleaned.match(/^([+-]?\d+(?:\.\d+)?)\s*([KMBT])?$/i);
  if (!match) return null;
  const num = Number(match[1]);
  if (!Number.isFinite(num)) return null;
  const suffix = (match[2] || '').toUpperCase();
  const mult = suffix === 'K' ? 1_000 : suffix === 'M' ? 1_000_000 : suffix === 'B' ? 1_000_000_000 : suffix === 'T' ? 1_000_000_000_000 : 1;
  return num * mult;
}

function formatCompactAmount(value: string | null): string {
  const n = parseNumericString(value);
  if (n === null) return 'N/A';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// Groups where P/E is a meaningful summary statistic (the fund's underlying is
// earnings-bearing equities). For everything else, the listing card swaps P/E
// out for a group-appropriate metric (see `pickThirdMetric`).
const EQUITY_GROUP_KEYS = new Set(['broad-equity', 'sector-thematic-equity', 'leveraged-inverse']);

interface ThirdMetric {
  label: string;
  value: string;
}

function pickThirdMetric(etf: EtfListingItem): ThirdMetric {
  const groupKey = getEtfGroupKey(etf.category);
  if (groupKey && EQUITY_GROUP_KEYS.has(groupKey)) {
    return { label: 'P/E Ratio', value: formatNumber(etf.pe) };
  }
  // Holdings count works as the generic stand-in for non-equity funds
  // (commodities/digital-assets, fixed income, allocation, derivative income):
  // it tells the reader how diversified the wrapper is without leaning on a
  // metric that only makes sense for equities.
  return { label: 'Holdings', value: etf.holdings !== null && etf.holdings !== undefined ? etf.holdings.toLocaleString('en-US') : 'N/A' };
}

function EtfCard({ etf }: { etf: EtfListingItem }): JSX.Element {
  const third = pickThirdMetric(etf);
  const score = etf.finalScore;

  return (
    <Link
      href={`/etfs/${etf.exchange}/${etf.symbol}`}
      prefetch={false}
      className="block bg-surface border border-border rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded">{etf.symbol}</span>
          <span className="text-xs text-muted">{etf.exchange}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {score !== null && <EtfScoreBadge score={score} variant="inline" />}
          {etf.payoutFrequency && <span className="text-xs text-muted bg-surface-2 px-2 py-0.5 rounded">{etf.payoutFrequency}</span>}
        </div>
      </div>

      <h3 className="text-heading text-sm font-medium mb-3 line-clamp-2 min-h-[2.5rem]">{etf.name}</h3>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted">AUM</span>
          <p className="text-heading font-medium">{formatCompactAmount(etf.aum)}</p>
        </div>
        <div>
          <span className="text-muted">Expense Ratio</span>
          <p className="text-heading font-medium">{etf.expenseRatio !== null ? `${etf.expenseRatio}%` : 'N/A'}</p>
        </div>
        <div>
          <span className="text-muted">{third.label}</span>
          <p className="text-heading font-medium">{third.value}</p>
        </div>
        <div>
          <span className="text-muted">Dividend Yield</span>
          <p className="text-heading font-medium">
            {etf.dividendYield !== null && etf.dividendYield !== 0 ? formatPercentageDecimal(etf.dividendYield) : '--'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function EtfListingGrid({
  data,
  dataPromise,
}: {
  data?: EtfListingResponse | null;
  dataPromise?: Promise<EtfListingResponse> | null;
}): JSX.Element | null {
  const resolvedData = dataPromise ? use(dataPromise) : data;

  if (!resolvedData) return null;

  if (resolvedData.etfs.length === 0) {
    return resolvedData.filtersApplied ? (
      <EmptyStateCard variant="inline" title="No ETFs match the current filters." description="Try adjusting your filter criteria to see more results." />
    ) : (
      <EmptyStateCard variant="inline" title="No ETFs found." description="Please try again later." />
    );
  }

  const { page, totalCount, totalPages } = resolvedData;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">
          Showing {resolvedData.etfs.length} of {totalCount.toLocaleString()} ETF{totalCount !== 1 ? 's' : ''}
          {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {resolvedData.etfs.map((etf) => (
          <EtfCard key={etf.id} etf={etf} />
        ))}
      </div>

      {totalPages > 1 && <EtfPagination currentPage={page} totalPages={totalPages} />}
    </div>
  );
}

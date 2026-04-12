import { EtfListingResponse, EtfListingItem } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Link from 'next/link';
import React, { use } from 'react';
import EtfPagination from './EtfPagination';

const MORNINGSTAR_INDICATORS: Array<{ key: keyof Pick<EtfListingItem, 'hasMorAnalyzerInfo' | 'hasMorRiskInfo' | 'hasMorPeopleInfo'>; label: string }> = [
  { key: 'hasMorAnalyzerInfo', label: 'Analyzer' },
  { key: 'hasMorRiskInfo', label: 'Risk' },
  { key: 'hasMorPeopleInfo', label: 'People' },
];

function MorningstarIndicators({ etf }: { etf: EtfListingItem }): JSX.Element {
  return (
    <PrivateWrapper>
      <div className="flex items-center gap-1" aria-label="Morningstar data available">
        {MORNINGSTAR_INDICATORS.map(({ key, label }) => (
          <span
            key={key}
            title={`Morningstar ${label}: ${etf[key] ? 'present' : 'missing'}`}
            className={`inline-block w-2 h-2 rounded-full ${etf[key] ? 'bg-emerald-400' : 'bg-gray-600'}`}
          />
        ))}
      </div>
    </PrivateWrapper>
  );
}

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

function EtfCard({ etf }: { etf: EtfListingItem }): JSX.Element {
  return (
    <Link
      href={`/etfs/${etf.exchange}/${etf.symbol}`}
      className="block bg-[#1F2937] border border-[#374151] rounded-lg p-4 hover:border-[#F59E0B] hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black text-xs font-bold px-2 py-0.5 rounded">{etf.symbol}</span>
          <span className="text-xs text-gray-400">{etf.exchange}</span>
          <MorningstarIndicators etf={etf} />
        </div>
        {etf.payoutFrequency && <span className="text-xs text-gray-400 bg-[#374151] px-2 py-0.5 rounded">{etf.payoutFrequency}</span>}
      </div>

      <h3 className="text-white text-sm font-medium mb-3 line-clamp-2 min-h-[2.5rem]">{etf.name}</h3>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">AUM</span>
          <p className="text-white font-medium">{formatCompactAmount(etf.aum)}</p>
        </div>
        <div>
          <span className="text-gray-400">Expense Ratio</span>
          <p className="text-white font-medium">{etf.expenseRatio !== null ? `${etf.expenseRatio}%` : 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-400">P/E Ratio</span>
          <p className="text-white font-medium">{formatNumber(etf.pe)}</p>
        </div>
        <div>
          <span className="text-gray-400">Dividend TTM</span>
          <p className="text-white font-medium">{etf.dividendTtm !== null && etf.dividendTtm !== 0 ? `$${formatNumber(etf.dividendTtm)}` : '--'}</p>
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
    return (
      <div className="text-center py-12">
        {resolvedData.filtersApplied ? (
          <>
            <p className="text-[#E5E7EB] text-lg">No ETFs match the current filters.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Try adjusting your filter criteria to see more results.</p>
          </>
        ) : (
          <>
            <p className="text-[#E5E7EB] text-lg">No ETFs found.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
          </>
        )}
      </div>
    );
  }

  const { page, totalCount, totalPages } = resolvedData;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
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

import type { SimilarEtf } from '@/types/etf/etf-detail-response-types';
import { formatNumber, formatPercentageDecimal, formatVolume } from '@/components/reportsv1/financialFormatters';
import { formatCompactAmount, formatCompactMillions } from '@/utils/etf-display-format-utils';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export interface SimilarEtfsProps {
  data: ReadonlyArray<SimilarEtf>;
}

interface ColumnDef {
  key: string;
  label: string;
  render: (etf: SimilarEtf) => string;
  align?: 'left' | 'right';
}

// Treat missing fields (undefined) the same as null. Cached responses from
// before this column set was added can omit them entirely, and we'd rather
// render "N/A" than crash inside a formatter.
function n(value: number | null | undefined): number | null {
  return value ?? null;
}

function formatInteger(value: number | null | undefined): string {
  const v = n(value);
  if (v === null) return 'N/A';
  return v.toLocaleString('en-US');
}

function formatRange(low: number | null | undefined, high: number | null | undefined): string {
  const l = n(low);
  const h = n(high);
  if (l === null && h === null) return 'N/A';
  return `${formatNumber(l)} - ${formatNumber(h)}`;
}

const COLUMNS: ColumnDef[] = [
  { key: 'aum', label: 'AUM', render: (e) => formatCompactAmount(e.aum), align: 'right' },
  { key: 'expenseRatio', label: 'Expense Ratio', render: (e) => (e.expenseRatio != null ? `${e.expenseRatio}%` : 'N/A'), align: 'right' },
  { key: 'pe', label: 'P/E', render: (e) => formatNumber(n(e.pe)), align: 'right' },
  { key: 'sharesOut', label: 'Shares Out', render: (e) => formatCompactMillions(e.sharesOut), align: 'right' },
  {
    key: 'dividendTtm',
    label: 'Div TTM',
    render: (e) => (e.dividendTtm != null && e.dividendTtm !== 0 ? `$${formatNumber(e.dividendTtm)}` : '--'),
    align: 'right',
  },
  { key: 'dividendYield', label: 'Div Yield', render: (e) => (e.dividendYield != null ? formatPercentageDecimal(e.dividendYield) : '--'), align: 'right' },
  { key: 'payoutFrequency', label: 'Payout Freq', render: (e) => e.payoutFrequency || 'N/A', align: 'left' },
  { key: 'payoutRatio', label: 'Payout Ratio', render: (e) => (e.payoutRatio != null ? formatPercentageDecimal(e.payoutRatio) : 'N/A'), align: 'right' },
  { key: 'volume', label: 'Volume', render: (e) => formatVolume(n(e.volume)), align: 'right' },
  { key: 'yearRange', label: '52W Range', render: (e) => formatRange(e.yearLow, e.yearHigh), align: 'right' },
  { key: 'beta', label: 'Beta', render: (e) => formatNumber(n(e.beta)), align: 'right' },
  { key: 'holdings', label: 'Holdings', render: (e) => formatInteger(e.holdings), align: 'right' },
];

function SimilarEtfMobileCard({ etf }: { etf: SimilarEtf }): JSX.Element {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
      <Link href={`/etfs/${etf.exchange.toUpperCase()}/${etf.symbol.toUpperCase()}`} className="flex items-start justify-between gap-2 group">
        <div className="min-w-0">
          <h3 className="font-semibold text-[#F59E0B] group-hover:text-[#F97316] transition-colors truncate">{etf.name}</h3>
          <div className="text-xs text-gray-400 mt-0.5">
            {etf.symbol} • {etf.exchange.toUpperCase()}
          </div>
        </div>
        <ArrowTopRightOnSquareIcon className="size-4 text-gray-400 group-hover:text-[#F59E0B] transition-colors flex-shrink-0 mt-1" />
      </Link>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {COLUMNS.map((col) => (
          <div key={col.key} className="flex justify-between border-b border-gray-700/60 pb-1">
            <dt className="text-gray-400">{col.label}</dt>
            <dd className="text-white font-mono tabular-nums text-right ml-2 truncate">{col.render(etf)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function SimilarEtfs({ data: similarEtfs }: SimilarEtfsProps): JSX.Element | null {
  if (!similarEtfs || similarEtfs.length === 0) {
    return null;
  }

  return (
    <div id="similar-etfs" className="bg-gray-900 rounded-lg shadow-sm p-4 sm:p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Similar ETFs</h2>
      <p className="text-gray-300 mb-4">True peers tracking the same or a very similar index in the same category:</p>

      {/* Desktop / tablet — horizontally-scrollable table. */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-gray-800 px-3 py-2 text-left font-semibold whitespace-nowrap">
                ETF
              </th>
              {COLUMNS.map((col) => (
                <th key={col.key} scope="col" className={`px-3 py-2 font-semibold whitespace-nowrap ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {similarEtfs.map((etf) => (
              <tr key={etf.id} className="hover:bg-gray-800/60 transition-colors">
                <td className="sticky left-0 z-10 bg-gray-900 hover:bg-gray-800/60 transition-colors px-3 py-2 whitespace-nowrap">
                  <Link href={`/etfs/${etf.exchange.toUpperCase()}/${etf.symbol.toUpperCase()}`} className="group inline-flex items-center gap-1.5">
                    <span className="font-medium bg-[#4F46E5] text-white text-xs px-1.5 py-0.5 rounded">{etf.symbol}</span>
                    <span className="text-[#F59E0B] group-hover:text-[#F97316] transition-colors max-w-[16rem] truncate">{etf.name}</span>
                    <ArrowTopRightOnSquareIcon className="size-3.5 text-gray-400 group-hover:text-[#F59E0B] transition-colors flex-shrink-0" />
                  </Link>
                </td>
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 whitespace-nowrap font-mono tabular-nums text-white ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {col.render(etf)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile — one stacked card per ETF. */}
      <div className="md:hidden flex flex-col gap-3">
        {similarEtfs.map((etf) => (
          <SimilarEtfMobileCard key={etf.id} etf={etf} />
        ))}
      </div>
    </div>
  );
}

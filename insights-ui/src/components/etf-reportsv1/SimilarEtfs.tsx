import type { SimilarEtf } from '@/types/etf/etf-detail-response-types';
import { formatNumber, formatPercentageDecimal, formatVolume } from '@/components/reportsv1/financialFormatters';
import { etfPeerKey, filterEtfPeersWithSlug } from '@/components/etf-reportsv1/EtfRelatedSections';
import { formatCompactAmount, formatCompactMillions } from '@/utils/etf-display-format-utils';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { Suspense, use } from 'react';

export interface SimilarEtfsProps {
  data: ReadonlyArray<SimilarEtf>;
  /**
   * Sub-report slug (e.g. "risk-analysis"). When set, each peer links to the
   * *same* sub-report page of that ETF instead of its main report page — so a
   * reader on the risk-analysis page lands on the peer's risk-analysis page.
   * Omit on the main detail page to link to the peer's main report.
   */
  linkSlug?: string;
}

interface SimilarEtfsTableProps extends SimilarEtfsProps {
  /**
   * `etfPeerKey`s of the peers that actually have a `linkSlug` report. Peers not
   * in the set link to their main ETF page, so the table never emits a link to a
   * sub-report page that renders the not-found page.
   */
  availableKeysPromise?: Promise<ReadonlySet<string>>;
}

/** Resolved stand-in for a missing `availableKeysPromise` so `use()` stays unconditional. */
const NO_AVAILABILITY_FILTER: Promise<ReadonlySet<string> | undefined> = Promise.resolve(undefined);

function etfHref(etf: SimilarEtf, linkSlug?: string, availableKeys?: ReadonlySet<string>): string {
  const base = `/etfs/${etf.exchange.toUpperCase()}/${etf.symbol.toUpperCase()}`;
  const hasSubPage = !!linkSlug && (!availableKeys || availableKeys.has(etfPeerKey(etf)));
  return hasSubPage ? `${base}/${linkSlug}` : base;
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

function SimilarEtfMobileCard({ etf, linkSlug, availableKeys }: { etf: SimilarEtf; linkSlug?: string; availableKeys?: ReadonlySet<string> }): JSX.Element {
  return (
    <div className="bg-surface-2 border border-border rounded-md p-4">
      <Link href={etfHref(etf, linkSlug, availableKeys)} prefetch={false} className="flex items-start justify-between gap-2 group">
        <div className="min-w-0">
          <h3 className="font-semibold text-link group-hover:text-link transition-colors truncate">{etf.name}</h3>
          <div className="text-xs text-muted mt-0.5">
            {etf.symbol} • {etf.exchange.toUpperCase()}
          </div>
        </div>
        <ArrowTopRightOnSquareIcon className="size-4 text-muted group-hover:text-link transition-colors flex-shrink-0 mt-1" />
      </Link>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {COLUMNS.map((col) => (
          <div key={col.key} className="flex justify-between border-b border-border pb-1">
            <dt className="text-muted">{col.label}</dt>
            <dd className="text-heading font-mono tabular-nums text-right ml-2 truncate">{col.render(etf)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SimilarEtfsTable({ data: similarEtfs, linkSlug, availableKeysPromise }: SimilarEtfsTableProps): JSX.Element | null {
  const availableKeys: ReadonlySet<string> | undefined = use(availableKeysPromise ?? NO_AVAILABILITY_FILTER);
  if (!similarEtfs || similarEtfs.length === 0) {
    return null;
  }

  return (
    <div id="similar-etfs" className="bg-surface rounded-lg shadow-sm p-4 sm:p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">Similar ETFs</h2>
      <p className="text-body mb-4">True peers tracking the same or a very similar index in the same category:</p>

      {/* Desktop / tablet — horizontally-scrollable table. */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-2 text-body">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-surface-2 px-3 py-2 text-left font-semibold whitespace-nowrap">
                ETF
              </th>
              {COLUMNS.map((col) => (
                <th key={col.key} scope="col" className={`px-3 py-2 font-semibold whitespace-nowrap ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {similarEtfs.map((etf) => (
              <tr key={etf.id} className="hover:bg-surface-3 transition-colors">
                <td className="sticky left-0 z-10 bg-surface hover:bg-surface-3 transition-colors px-3 py-2 whitespace-nowrap">
                  <Link href={etfHref(etf, linkSlug, availableKeys)} prefetch={false} className="group inline-flex items-center gap-1.5">
                    <span className="font-medium bg-primary text-primary-text text-xs px-1.5 py-0.5 rounded">{etf.symbol}</span>
                    <span className="text-link group-hover:text-link transition-colors max-w-[16rem] truncate">{etf.name}</span>
                    <ArrowTopRightOnSquareIcon className="size-3.5 text-muted group-hover:text-link transition-colors flex-shrink-0" />
                  </Link>
                </td>
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 whitespace-nowrap font-mono tabular-nums text-heading ${col.align === 'right' ? 'text-right' : 'text-left'}`}
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
          <SimilarEtfMobileCard key={etf.id} etf={etf} linkSlug={linkSlug} availableKeys={availableKeys} />
        ))}
      </div>
    </div>
  );
}

/**
 * "Similar ETFs" comparison table.
 *
 * When `linkSlug` is set, the peer sub-report availability is resolved behind a
 * Suspense boundary so the (small, indexed) lookup never blocks the report body,
 * and peers without that sub-report link to their main ETF page instead of a
 * URL that would render the not-found page.
 */
export default function SimilarEtfs({ data, linkSlug }: SimilarEtfsProps): JSX.Element | null {
  if (!data || data.length === 0) {
    return null;
  }
  if (!linkSlug) {
    return <SimilarEtfsTable data={data} />;
  }

  // Never rejects: a failed lookup degrades to "no peer has this sub-report", so
  // every peer links to its main ETF page rather than failing the whole report.
  const availableKeysPromise: Promise<ReadonlySet<string>> = filterEtfPeersWithSlug(data, linkSlug).catch(() => new Set<string>());

  return (
    <Suspense fallback={<SimilarEtfsTable data={data} />}>
      <SimilarEtfsTable data={data} linkSlug={linkSlug} availableKeysPromise={availableKeysPromise} />
    </Suspense>
  );
}

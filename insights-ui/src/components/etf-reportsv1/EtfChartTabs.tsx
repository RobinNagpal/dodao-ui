'use client';

/**
 * Lightweight shell for the ETF Price / Returns / CAGR tabbed chart section.
 *
 * The actual chart rendering (PriceChart line + Bar chart + chart.js +
 * react-chartjs-2) lives in `EtfChartTabsChartBody.tsx` and is loaded via the
 * stock-side two-layer deferral pattern (see PriceChartLazy.tsx for the
 * original rationale):
 *
 *   1. `dynamic({ ssr: false })` keeps the chart.js chunk out of the server
 *      render and the main client bundle.
 *   2. `useInView` keeps the dynamic import from firing until the section is
 *      near the viewport — without this Next.js still fetches + evaluates the
 *      chunk right after hydration even though `ssr: false` skipped SSR. That
 *      hydration burst was the dominant TBT contributor on mobile.
 *
 * The shell still owns tab state + range pill UI so users can toggle Price /
 * Returns / CAGR / range while the chart body is still loading; the active
 * selection is just passed down once the body mounts.
 */

import type { PriceHistoryResponse, PriceRangeKey } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { EtfPerformanceMetricsPayload } from '@/utils/etf-performance-metrics-utils';
import { useInView } from '@/util/use-in-view';
import type { EtfChartTabKey, EtfChartTabsChartBodyProps } from './EtfChartTabsChartBody';

// Local copy of the range list so the shell doesn't have to import PriceChart
// (which would side-effect-import chart.js + react-chartjs-2 at module load).
const PRICE_CHART_RANGES: ReadonlyArray<PriceRangeKey> = ['1M', '6M', '1Y', '3Y', '5Y'] as const;

interface EtfChartTabsProps {
  priceHistory: PriceHistoryResponse | null;
  performanceMetrics: EtfPerformanceMetricsPayload | null;
  etfSymbol: string;
}

const TAB_LABELS: Record<EtfChartTabKey, string> = {
  price: 'Price',
  return: 'Returns',
  cagr: 'CAGR',
};

// Per-tab heading shown on the left of the header row. Price reuses the
// standalone PriceChart's familiar "Price History" label so users moving
// between standalone (stocks) and embedded (ETFs) chart UIs don't have to
// re-learn it.
const TAB_HEADINGS: Record<EtfChartTabKey, string> = {
  price: 'Price History',
  return: 'Returns',
  cagr: 'CAGR',
};

const ACCENT_COLOR = '#10b981';

function ChartBodySkeleton(): JSX.Element {
  // Matches the live chart's `h-64 sm:h-72` height so swapping in the real
  // chart causes zero layout shift.
  return <div className="h-64 sm:h-72 rounded bg-surface-2 animate-pulse" />;
}

const EtfChartTabsChartBody = dynamic<EtfChartTabsChartBodyProps>(() => import('./EtfChartTabsChartBody'), {
  ssr: false,
  loading: () => <ChartBodySkeleton />,
});

export default function EtfChartTabs({ priceHistory, performanceMetrics, etfSymbol }: EtfChartTabsProps): JSX.Element | null {
  const hasReturnsData = useMemo(() => !!performanceMetrics?.returns.values.some((v) => v.etf !== null), [performanceMetrics]);
  const hasCagrData = useMemo(() => !!performanceMetrics?.cagr.values.some((v) => v.etf !== null), [performanceMetrics]);
  const hasPriceData = !!priceHistory;

  const availableTabs: EtfChartTabKey[] = [];
  if (hasPriceData) availableTabs.push('price');
  if (hasReturnsData) availableTabs.push('return');
  if (hasCagrData) availableTabs.push('cagr');

  const [activeTab, setActiveTab] = useState<EtfChartTabKey>(availableTabs[0] ?? 'price');
  // Range state lives here (not inside PriceChart) so the range pill can sit
  // in the section header row alongside the main tabs.
  const [priceRange, setPriceRange] = useState<PriceRangeKey>('5Y');
  const { ref, inView } = useInView<HTMLDivElement>();

  if (availableTabs.length === 0) return null;

  const safeTab: EtfChartTabKey = availableTabs.includes(activeTab) ? activeTab : availableTabs[0];

  // Meta line shown under the heading. Drop the daily/weekly hint that the
  // standalone chart shows — it adds vertical noise and the user can infer
  // the cadence from the time-axis labels.
  const metaLine: string | null =
    safeTab === 'price'
      ? priceHistory?.currency ?? null
      : performanceMetrics?.category
      ? `Category: ${performanceMetrics.category}${performanceMetrics.categoryPeerCount > 0 ? ` • ${performanceMetrics.categoryPeerCount} peers` : ''}`
      : null;

  return (
    <section ref={ref} id="etf-chart-tabs" className="bg-surface rounded-lg shadow-sm px-2 py-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="sm:flex-shrink-0 min-w-0">
          <h3 className="text-lg font-semibold text-heading">{TAB_HEADINGS[safeTab]}</h3>
          {metaLine && <p className="text-xs text-muted mt-1 truncate">{metaLine}</p>}
        </div>

        {/* Center: range pill (Price tab only). Sits in its own segmented-
           control container so it reads as a sub-control belonging to Price,
           distinct from the main Price/Returns/CAGR tabs on the right. */}
        {safeTab === 'price' && (
          <div className="sm:flex-1 flex sm:justify-center">
            <div className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1 ring-1 ring-border">
              {PRICE_CHART_RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPriceRange(r)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    priceRange === r ? 'text-heading' : 'text-body hover:bg-surface-3 hover:text-heading'
                  }`}
                  style={priceRange === r ? { backgroundColor: ACCENT_COLOR } : {}}
                  aria-pressed={priceRange === r}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                safeTab === tab ? 'text-heading' : 'bg-surface-2 text-body hover:bg-surface-3 hover:text-heading'
              }`}
              style={safeTab === tab ? { backgroundColor: ACCENT_COLOR } : {}}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {inView ? (
        <EtfChartTabsChartBody
          activeTab={safeTab}
          priceHistory={priceHistory}
          performanceMetrics={performanceMetrics}
          etfSymbol={etfSymbol}
          priceRange={priceRange}
        />
      ) : (
        <ChartBodySkeleton />
      )}
    </section>
  );
}

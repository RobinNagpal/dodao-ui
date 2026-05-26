'use client';

/**
 * Client-side dynamic wrapper around PriceChart. The chart pulls in chart.js +
 * react-chartjs-2 (~260 KB raw / ~80 KB gz across the radar / price /
 * quarterly / quadrant set that share the chart.js chunk).
 *
 * Two-layer deferral:
 *   1. `dynamic({ ssr: false })` keeps the chart out of the server render
 *      and the main client bundle.
 *   2. `useInView` keeps the dynamic import from firing until the section is
 *      near the viewport — without this Next.js still fetches and evaluates
 *      the chunk right after hydration even though `ssr: false` skipped SSR.
 *      That hydration burst was the dominant source of TBT on mobile.
 *
 * The skeleton mirrors the chart's outer layout so there's no layout shift
 * when the real chart swaps in. It's reused by both the not-yet-in-view
 * state and the dynamic loader.
 */

import type { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { useInView } from '@/util/use-in-view';
import dynamic from 'next/dynamic';

interface PriceChartLazyProps {
  data: PriceHistoryResponse;
}

function PriceChartSkeleton(): JSX.Element {
  return (
    <section id="price-chart" className="bg-gray-900 rounded-lg shadow-sm px-2 py-3 sm:p-4 mb-6">
      {/* min-h matches the real chart's header row (text-lg title + text-xs meta + mt-1 = ~44px). */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-h-[44px]">
        <div>
          <div className="h-6 w-32 rounded bg-gray-800 animate-pulse" />
          <div className="h-3 w-20 rounded bg-gray-800 animate-pulse mt-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* h-7 = 28px, matching the real button's px-3 py-1.5 text-xs = ~28px total height. */}
          {['1M', '6M', '1Y', '3Y', '5Y'].map((label) => (
            <div key={label} className="h-7 w-12 rounded-md bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72 rounded bg-gray-800 animate-pulse" />
    </section>
  );
}

const PriceChartImpl = dynamic(() => import('./PriceChart'), {
  ssr: false,
  loading: () => <PriceChartSkeleton />,
});

export default function PriceChartLazy(props: PriceChartLazyProps): JSX.Element {
  const { ref, inView } = useInView<HTMLDivElement>();
  return <div ref={ref}>{inView ? <PriceChartImpl {...props} /> : <PriceChartSkeleton />}</div>;
}

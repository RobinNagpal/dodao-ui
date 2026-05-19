'use client';

/**
 * Client-side dynamic wrapper around QuarterlyMetricsChart. Same motivation
 * and shape as PriceChartLazy — see that file for the rationale. The chart
 * shares the chart.js chunk with the price / radar / quadrant charts; once
 * any one of them comes into view the shared chunk loads for all of them.
 */

import type { QuarterlyChartDataResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/quarterly-chart-data/route';
import { useInView } from '@/util/use-in-view';
import dynamic from 'next/dynamic';

interface QuarterlyMetricsChartLazyProps {
  data: QuarterlyChartDataResponse;
}

function QuarterlyMetricsChartSkeleton(): JSX.Element {
  return (
    <section id="quarterly-metrics-chart" className="bg-gray-900 rounded-lg shadow-sm px-2 py-3 sm:p-4 mb-6">
      {/* min-h matches the real chart's header row (text-lg title + text-xs meta + mt-1 = ~44px). */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-h-[44px]">
        <div>
          <div className="h-6 w-56 rounded bg-gray-800 animate-pulse" />
          <div className="h-3 w-24 rounded bg-gray-800 animate-pulse mt-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* h-7 matches the real button's 28px effective height. Always 6 placeholders;
              real chart may have fewer (1–6) — see PR description for the residual mobile-wrap consideration. */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-7 w-16 rounded-md bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72 rounded bg-gray-800 animate-pulse" />
    </section>
  );
}

const QuarterlyMetricsChartImpl = dynamic(() => import('./QuarterlyMetricsChart'), {
  ssr: false,
  loading: () => <QuarterlyMetricsChartSkeleton />,
});

export default function QuarterlyMetricsChartLazy(props: QuarterlyMetricsChartLazyProps): JSX.Element {
  const { ref, inView } = useInView<HTMLDivElement>();
  return <div ref={ref}>{inView ? <QuarterlyMetricsChartImpl {...props} /> : <QuarterlyMetricsChartSkeleton />}</div>;
}

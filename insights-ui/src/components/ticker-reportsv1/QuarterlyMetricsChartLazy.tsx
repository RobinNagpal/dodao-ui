'use client';

/**
 * Client-side dynamic wrapper around QuarterlyMetricsChart. Same motivation
 * as PriceChartLazy: defers chart.js + react-chartjs-2 out of the main bundle.
 * Both charts share the chart.js chunk in webpack's output, so the cost is
 * paid once across them.
 */

import dynamic from 'next/dynamic';

const QuarterlyMetricsChartLazy = dynamic(() => import('./QuarterlyMetricsChart'), {
  ssr: false,
  loading: () => (
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
  ),
});

export default QuarterlyMetricsChartLazy;

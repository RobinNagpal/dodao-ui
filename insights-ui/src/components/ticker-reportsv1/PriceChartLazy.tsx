'use client';

/**
 * Client-side dynamic wrapper around PriceChart. The chart pulls in chart.js +
 * react-chartjs-2 (~100 KB combined gzipped); deferring it out of the main
 * bundle cuts main-bundle parse/hydration cost on initial load. The chart
 * lives below the fold, so it's not on the LCP path.
 *
 * The loading skeleton mirrors the chart section's outer layout (background,
 * padding, header row, chart canvas height) so there's no layout shift when
 * the chart chunk arrives and renders.
 */

import dynamic from 'next/dynamic';

const PriceChartLazy = dynamic(() => import('./PriceChart'), {
  ssr: false,
  loading: () => (
    <section id="price-chart" className="bg-gray-900 rounded-lg shadow-sm px-2 py-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="h-6 w-32 rounded bg-gray-800 animate-pulse" />
          <div className="h-3 w-20 rounded bg-gray-800 animate-pulse mt-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['1M', '6M', '1Y', '3Y', '5Y'].map((label) => (
            <div key={label} className="h-8 w-12 rounded-md bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72 rounded bg-gray-800 animate-pulse" />
    </section>
  ),
});

export default PriceChartLazy;

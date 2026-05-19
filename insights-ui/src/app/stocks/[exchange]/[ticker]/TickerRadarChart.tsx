'use client';

import { RadarSkeleton } from '@/app/stocks/[exchange]/[ticker]/RadarSkeleton';
import { SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import { useInView } from '@/util/use-in-view';
import dynamic from 'next/dynamic';

type RadarChartProps = Readonly<{ data: SpiderGraphForTicker; scorePercentage: number }>;

const RadarChartImpl = dynamic<RadarChartProps>(() => import('@/components/visualizations/RadarChart'), {
  ssr: false,
  loading: () => <RadarSkeleton />,
});

// The radar lives in the hero area, so the observer typically fires on the
// first frame after mount — but routing the chunk fetch through an effect
// instead of through the hydration tree lets the main thread settle the
// hydration burst first. On mobile-throttled CPUs that one-frame gap is
// what pushes chart.js eval (~1.1s in the field) off the TBT window.
export const TickerRadarChart = function TickerRadarChart(props: RadarChartProps): JSX.Element {
  const { ref, inView } = useInView<HTMLDivElement>();
  return <div ref={ref}>{inView ? <RadarChartImpl {...props} /> : <RadarSkeleton />}</div>;
};

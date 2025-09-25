'use client';

import { RadarSkeleton } from '@/app/stocks/[exchange]/[ticker]/RadarSkeleton';
import { SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import dynamic from 'next/dynamic';

type RadarChartProps = Readonly<{ data: SpiderGraphForTicker; scorePercentage: number }>;
export const TickerRadarChart = dynamic<RadarChartProps>(() => import('@/components/visualizations/RadarChart'), {
  ssr: false,
  loading: () => <RadarSkeleton />,
});

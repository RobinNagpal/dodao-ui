'use client';

import type { EtfScoresResponse } from '@/types/etf/etf-detail-response-types';
import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import { buildEtfSpiderGraph } from '@/utils/etf-analysis-reports/etf-spider-graph';
import SpiderChartFlyoutMenu from '@/app/public-equities/tickers/[tickerKey]/SpiderChartFlyoutMenu';
import { RadarSkeleton } from '@/app/stocks/[exchange]/[ticker]/RadarSkeleton';
import RadarChartFrame from '@/components/ui/containers/RadarChartFrame';
import { useInView } from '@/util/use-in-view';
import dynamic from 'next/dynamic';

// Two-layer deferral mirroring TickerRadarChart on the stock side:
//   1. `dynamic({ ssr: false })` keeps the chart.js + react-chartjs-2 chunk
//      out of the server render and the main client bundle.
//   2. `useInView` keeps the dynamic import from firing during hydration so
//      chart.js eval doesn't land in the TBT window on mobile-throttled CPUs
//      (see TickerRadarChart.tsx for the original rationale).
// NOTE: this legacy client radar is kept for rollback; the ETF page now renders
// the server-side EtfRadarChartSvg. `buildEtfSpiderGraph` moved to a shared util
// so both can use it.
const RadarChart = dynamic(() => import('@/components/visualizations/RadarChart'), {
  ssr: false,
  loading: () => <RadarSkeleton />,
});

interface EtfRadarChartProps {
  scores: EtfScoresResponse | null;
  analysis: EtfAnalysisResponse | null;
}

export default function EtfRadarChart({ scores, analysis }: EtfRadarChartProps): JSX.Element | null {
  const spiderGraph = buildEtfSpiderGraph(scores, analysis);
  // Hooks must run on every render path that reaches this component, so the
  // viewport observer is created before any early returns.
  const { ref, inView } = useInView<HTMLDivElement>();

  if (!spiderGraph) return null;

  const hasAnyData = Object.values(spiderGraph).some((cat) => cat.scores.length > 0);
  if (!hasAnyData) return null;

  const scorePercentage = getSpiderGraphScorePercentage(spiderGraph);

  return (
    <div ref={ref} className="w-full max-w-lg relative pb-4" style={{ minHeight: '400px', contain: 'layout size' }}>
      <div className="absolute top-20 right-0 flex space-x-2" style={{ zIndex: 10 }}>
        <div className="text-2xl font-bold" style={{ color: 'var(--primary-color, blue)' }}>
          {scorePercentage.toFixed(0)}%
        </div>
        <SpiderChartFlyoutMenu />
      </div>
      {/* RadarSkeleton already wraps itself in a RadarChartFrame, so the
          not-in-view and in-view branches render parallel — same outer box
          either way, zero layout shift on load. */}
      {inView ? (
        <RadarChartFrame>
          <RadarChart data={spiderGraph} scorePercentage={scorePercentage} />
        </RadarChartFrame>
      ) : (
        <RadarSkeleton />
      )}
    </div>
  );
}

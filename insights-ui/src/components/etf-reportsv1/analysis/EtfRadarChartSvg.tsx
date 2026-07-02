import type { EtfScoresResponse } from '@/types/etf/etf-detail-response-types';
import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import SpiderChartFlyoutMenu from '@/app/public-equities/tickers/[tickerKey]/SpiderChartFlyoutMenu';
import TickerRadarChartSvg from '@/components/visualizations/TickerRadarChartSvg';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import { buildEtfSpiderGraph } from '@/utils/etf-analysis-reports/etf-spider-graph';

/**
 * Server-rendered SVG version of the ETF spider/radar chart — the ETF-side
 * parallel to how the stock detail page uses `TickerRadarChartSvg`. Builds the
 * shared spider-graph shape from ETF scores + analysis and draws it as plain
 * SVG on the server (no chart.js, no client JS). The legacy client
 * `EtfRadarChart` is kept for rollback.
 */

interface EtfRadarChartSvgProps {
  scores: EtfScoresResponse | null;
  analysis: EtfAnalysisResponse | null;
}

export default function EtfRadarChartSvg({ scores, analysis }: EtfRadarChartSvgProps): JSX.Element | null {
  const spiderGraph = buildEtfSpiderGraph(scores, analysis);
  if (!spiderGraph) return null;

  const hasAnyData = Object.values(spiderGraph).some((cat) => cat.scores.length > 0);
  if (!hasAnyData) return null;

  const scorePercentage = getSpiderGraphScorePercentage(spiderGraph);

  return (
    <div className="w-full max-w-lg relative pb-4" style={{ minHeight: '400px', contain: 'layout size' }}>
      <div className="absolute top-20 right-0 flex space-x-2" style={{ zIndex: 10 }}>
        <div className="text-2xl font-bold" style={{ color: 'var(--primary-color, blue)' }}>
          {scorePercentage.toFixed(0)}%
        </div>
        <SpiderChartFlyoutMenu />
      </div>
      <TickerRadarChartSvg data={spiderGraph} scorePercentage={scorePercentage} />
    </div>
  );
}

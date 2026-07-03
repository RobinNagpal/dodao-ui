import TickerRadarChartSvg from '@/components/visualizations/TickerRadarChartSvg';
import { buildCommoditySpiderGraph, CommodityCategoryResultWithFactors } from '@/utils/commodity-analysis-reports/commodity-spider-graph';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';

/**
 * Server-rendered radar chart for a commodity — the commodity parallel to
 * `EtfRadarChartSvg`. Builds the shared spider-graph shape from the four scored
 * categories and draws it as plain SVG (no client JS). Returns null until at
 * least one category has been generated.
 */
export default function CommodityRadarChart({ categoryResults }: { categoryResults: CommodityCategoryResultWithFactors[] }): JSX.Element | null {
  const spiderGraph = buildCommoditySpiderGraph(categoryResults);
  if (!spiderGraph) return null;

  const scorePercentage = getSpiderGraphScorePercentage(spiderGraph);

  return (
    <div className="w-full max-w-lg relative pb-4" style={{ minHeight: '400px', contain: 'layout size' }}>
      <div className="absolute top-20 right-0 flex space-x-2" style={{ zIndex: 10 }}>
        <div className="text-2xl font-bold" style={{ color: 'var(--primary-color, blue)' }}>
          {scorePercentage.toFixed(0)}%
        </div>
      </div>
      <TickerRadarChartSvg data={spiderGraph} scorePercentage={scorePercentage} />
    </div>
  );
}

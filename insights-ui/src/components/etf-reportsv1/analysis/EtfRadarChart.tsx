'use client';

import { EtfScoresResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/scores/route';
import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import dynamic from 'next/dynamic';

const RadarChart = dynamic(() => import('@/components/visualizations/RadarChart'), {
  ssr: false,
  loading: () => <div className="w-full aspect-square bg-gray-800 rounded-lg animate-pulse" />,
});

const CATEGORY_NAMES: Record<string, string> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: 'Performance & Returns',
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: 'Cost & Team',
  [EtfAnalysisCategory.RiskAnalysis]: 'Risk Analysis',
};

export function buildEtfSpiderGraph(scores: EtfScoresResponse | null, analysis: EtfAnalysisResponse | null): SpiderGraphForTicker | null {
  if (!scores && (!analysis || analysis.categories.length === 0)) return null;

  const graph: SpiderGraphForTicker = {};
  const categories = [EtfAnalysisCategory.PerformanceAndReturns, EtfAnalysisCategory.CostEfficiencyAndTeam, EtfAnalysisCategory.RiskAnalysis];

  for (const cat of categories) {
    const categoryResult = analysis?.categories.find((c) => c.categoryKey === cat);
    const factorScores = categoryResult
      ? categoryResult.factorResults.map((f) => ({
          score: f.result === 'Pass' ? 1 : 0,
          comment: `${f.factorKey}: ${f.oneLineExplanation}`,
        }))
      : [];

    graph[cat] = {
      key: cat,
      name: CATEGORY_NAMES[cat] || cat,
      summary: categoryResult?.summary || '',
      scores: factorScores,
    };
  }

  return graph;
}

interface EtfRadarChartProps {
  scores: EtfScoresResponse | null;
  analysis: EtfAnalysisResponse | null;
}

export default function EtfRadarChart({ scores, analysis }: EtfRadarChartProps): JSX.Element | null {
  const spiderGraph = buildEtfSpiderGraph(scores, analysis);
  if (!spiderGraph) return null;

  const hasAnyData = Object.values(spiderGraph).some((cat) => cat.scores.length > 0);
  if (!hasAnyData) return null;

  const scorePercentage = getSpiderGraphScorePercentage(spiderGraph);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 text-sm font-semibold text-gray-300">{Math.round(scorePercentage)}%</div>
      <RadarChart data={spiderGraph} scorePercentage={scorePercentage} />
    </div>
  );
}

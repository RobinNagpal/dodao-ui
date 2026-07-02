import type { EtfScoresResponse } from '@/types/etf/etf-detail-response-types';
import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { findFactorDefinition } from '@/utils/etf-analysis-reports/etf-analysis-factor-utils';
import { SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';

/**
 * Builds the ETF spider-graph shape shared by both the (legacy) client
 * `EtfRadarChart` and the server-rendered `EtfRadarChartSvg`. Kept in a plain
 * util (no `'use client'`) so it can run on the server — a `'use client'`
 * module's exports become client references and can't be called during SSR.
 */

const CATEGORY_NAMES: Record<string, string> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: 'Performance & Returns',
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: 'Cost & Team',
  [EtfAnalysisCategory.RiskAnalysis]: 'Risk Analysis',
  [EtfAnalysisCategory.FuturePerformanceOutlook]: 'Future Outlook',
};

function getFactorTitle(categoryKey: string, factorKey: string): string {
  const category = categoryKey as EtfAnalysisCategory;
  const factor = findFactorDefinition(category, factorKey);
  return factor?.factorAnalysisTitle || factorKey;
}

export function buildEtfSpiderGraph(scores: EtfScoresResponse | null, analysis: EtfAnalysisResponse | null): SpiderGraphForTicker | null {
  if (!scores && (!analysis || analysis.categories.length === 0)) return null;

  const graph: SpiderGraphForTicker = {};
  const categories = [
    EtfAnalysisCategory.PerformanceAndReturns,
    EtfAnalysisCategory.CostEfficiencyAndTeam,
    EtfAnalysisCategory.RiskAnalysis,
    EtfAnalysisCategory.FuturePerformanceOutlook,
  ];

  for (const cat of categories) {
    const categoryResult = analysis?.categories.find((c) => c.categoryKey === cat);
    const factorScores = categoryResult
      ? categoryResult.factorResults.map((f) => ({
          score: f.result === 'Pass' ? 1 : 0,
          comment: `${getFactorTitle(cat, f.factorKey)}: ${f.oneLineExplanation}`,
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

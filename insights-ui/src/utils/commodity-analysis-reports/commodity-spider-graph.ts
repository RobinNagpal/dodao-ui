import { CommodityAnalysisCategory, COMMODITY_CATEGORY_NAMES } from '@/types/commodity/commodity-analysis-types';
import { getCommodityFactorTitle } from '@/utils/commodity-analysis-reports/commodity-analysis-factor-utils';
import { SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import { CommodityAnalysisCategoryFactorResult, CommodityCategoryAnalysisResult } from '@prisma/client';

export type CommodityCategoryResultWithFactors = CommodityCategoryAnalysisResult & { factorResults: CommodityAnalysisCategoryFactorResult[] };

/**
 * Build the shared spider-graph shape (reused by `TickerRadarChartSvg`) from a
 * commodity's four scored-category results. Kept as a plain server-safe util so
 * it can run during SSR. Categories with no result yet contribute an empty slice.
 */
export function buildCommoditySpiderGraph(categoryResults: CommodityCategoryResultWithFactors[]): SpiderGraphForTicker | null {
  if (!categoryResults || categoryResults.length === 0) return null;

  const graph: SpiderGraphForTicker = {};
  const categories = [
    CommodityAnalysisCategory.SupplyAndDemand,
    CommodityAnalysisCategory.PriceAndValue,
    CommodityAnalysisCategory.VolatilityAndRisk,
    CommodityAnalysisCategory.FutureOutlook,
  ];

  for (const cat of categories) {
    const result = categoryResults.find((c) => c.categoryKey === cat);
    const scores = result
      ? result.factorResults.map((f) => ({
          score: f.result === 'Pass' ? 1 : 0,
          comment: `${getCommodityFactorTitle(cat, f.factorKey)}: ${f.oneLineExplanation}`,
        }))
      : [];

    graph[cat] = {
      key: cat,
      name: COMMODITY_CATEGORY_NAMES[cat],
      summary: result?.summary || '',
      scores,
    };
  }

  const hasAny = Object.values(graph).some((g) => g.scores.length > 0);
  return hasAny ? graph : null;
}

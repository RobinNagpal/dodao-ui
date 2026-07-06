import {
  computeCommodityFinalScore,
  getAllCommodityBasicInfo,
  getCommodityBasicInfo,
  getCommodityReportJson,
} from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { SimilarCommodity } from '@/utils/commodity-analysis-reports/get-similar-commodities-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/** How many peers to surface — capped at 3, matching the stock similar section. */
const SIMILAR_COMMODITIES_LIMIT = 3;

/**
 * Peers for a commodity: other commodities in the same `commodityGroup`, ordered
 * by final score (desc) then name. The report pages fetch this instead of
 * computing it inline. Data comes from the static `commodity-data` JSON.
 */
async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; slug: string }> }): Promise<SimilarCommodity[]> {
  const { slug } = await context.params;
  const current = getCommodityBasicInfo(slug);
  if (!current) return [];

  return getAllCommodityBasicInfo()
    .filter((c) => c.commodityGroup === current.commodityGroup && c.slug !== current.slug)
    .map((c) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      commodityGroup: c.commodityGroup,
      finalScore: computeCommodityFinalScore(getCommodityReportJson(c.slug)),
    }))
    .sort((a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1) || a.name.localeCompare(b.name))
    .slice(0, SIMILAR_COMMODITIES_LIMIT);
}

export const GET = withErrorHandlingV2<SimilarCommodity[]>(getHandler);

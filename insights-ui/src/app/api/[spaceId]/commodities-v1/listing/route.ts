import {
  computeCommodityFinalScore,
  getAllCommodityBasicInfo,
  getCommodityReportJson,
} from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/** One row in the public commodities listing (grouped by `commodityGroup`). */
export interface CommodityListItem {
  id: string;
  slug: string;
  name: string;
  commodityGroup: string;
  finalScore: number | null;
}

/**
 * Public listing of every commodity, ordered by group then name, with each
 * commodity's final score. Backs the `/commodities` index page so it fetches
 * through the API — data now comes from the static `commodity-data` JSON instead
 * of the database. `finalScore` is null until a report JSON is published.
 */
async function getHandler(_req: NextRequest): Promise<CommodityListItem[]> {
  return getAllCommodityBasicInfo().map((c) => ({
    id: c.slug,
    slug: c.slug,
    name: c.name,
    commodityGroup: c.commodityGroup,
    finalScore: computeCommodityFinalScore(getCommodityReportJson(c.slug)),
  }));
}

export const GET = withErrorHandlingV2<CommodityListItem[]>(getHandler);

import { CommodityListItem, getCommodityListingItems } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// Re-exported so existing importers (`@/app/api/.../listing/route`) keep working;
// the type + mapping now live in `get-commodity-report-data-utils` and are shared
// with the home-page showcase.
export type { CommodityListItem } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';

/**
 * Public listing of every commodity, ordered by group then name, with each
 * commodity's final score. Backs the `/commodities` index page so it fetches
 * through the API — data comes from the static `commodity-data` JSON instead
 * of the database. `finalScore` is null until a report JSON is published.
 */
async function getHandler(_req: NextRequest): Promise<CommodityListItem[]> {
  return getCommodityListingItems();
}

export const GET = withErrorHandlingV2<CommodityListItem[]>(getHandler);

import { CommodityWithAllData, fetchCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Full commodity report payload (commodity + key facts + cached score + scored
 * category results with factors) for one slug. Backs the main report and the
 * scored-category sub-reports so those pages fetch through the API instead of
 * querying prisma directly. Date fields serialize to ISO strings over JSON; the
 * client fetcher (`fetchCommodityReport`) revives them back into `Date`s.
 */
async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; slug: string }> }): Promise<CommodityWithAllData> {
  const { slug } = await context.params;
  return fetchCommodityWithAllData(slug);
}

export const GET = withErrorHandlingV2<CommodityWithAllData>(getHandler);

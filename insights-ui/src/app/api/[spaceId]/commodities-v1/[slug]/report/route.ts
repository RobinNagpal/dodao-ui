import { CommodityWithAllData, getCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Full commodity report payload (basic info + key facts + scored category
 * results with factors) for one slug. Backs the main report and the scored
 * category sub-reports so those pages fetch through the API. Data comes from the
 * static `commodity-data/reports/<slug>.json` file. Throws when no report exists
 * for the slug so the client fetcher can surface a 404 → `notFound()`.
 */
async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; slug: string }> }): Promise<CommodityWithAllData> {
  const { slug } = await context.params;
  const commodity = getCommodityWithAllData(slug);
  if (!commodity) throw new Error(`No commodity report found for slug "${slug}"`);
  return commodity;
}

export const GET = withErrorHandlingV2<CommodityWithAllData>(getHandler);

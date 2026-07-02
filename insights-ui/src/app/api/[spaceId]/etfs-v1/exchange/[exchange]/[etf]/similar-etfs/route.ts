import { EtfSimilarEtfsResponse, getSimilarEtfsForEtf } from '@/utils/etf-similar-etfs-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Per-ETF "similar ETFs" endpoint. Returns the source ETF's stored peers,
 * hydrated with name + financial info for the comparison table on the category
 * sub-report pages. Split out of `/full-render` (which the main detail page
 * uses) so the sub-pages can fetch just this slice with their own cache tag.
 */
async function getHandler(
  _req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfSimilarEtfsResponse> {
  const { spaceId, exchange, etf } = await context.params;
  const similarEtfs = await getSimilarEtfsForEtf(spaceId, exchange, etf);
  return { similarEtfs };
}

export const GET = withErrorHandlingV2<EtfSimilarEtfsResponse>(getHandler);

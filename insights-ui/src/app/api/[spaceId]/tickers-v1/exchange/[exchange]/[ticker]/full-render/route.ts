import { fetchTickerFullRenderData, TickerFullRenderResponse } from '@/utils/ticker-full-render-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Consolidated payload for the main `/stocks/[exchange]/[ticker]` page.
 *
 * The page used to issue six separately-tagged `fetch()`es (one each for
 * ticker, similar, financial-info, quarterly-chart, price-history,
 * competition). Each became one Data Cache entry, so a single umbrella
 * invalidation cost 1 HTML ISR write + 6 Data Cache writes per rebuild.
 * Routing the page through this endpoint collapses the per-rebuild cost to
 * 1 HTML + 1 Data Cache entry.
 */
async function getHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }
): Promise<TickerFullRenderResponse> {
  const { spaceId, exchange, ticker } = await params;
  return fetchTickerFullRenderData(spaceId, exchange, ticker);
}

export const GET = withErrorHandlingV2<TickerFullRenderResponse>(getHandler);

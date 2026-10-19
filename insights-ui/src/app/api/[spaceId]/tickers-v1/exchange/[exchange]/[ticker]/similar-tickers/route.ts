import { SimilarTicker } from '@/utils/ticker-v1-model-utils';
import { getSimilarTickers } from '@/utils/ticker-v1-page-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }): Promise<SimilarTicker[]> {
  const { spaceId, ticker, exchange } = await context.params;
  return getSimilarTickers(spaceId, exchange, ticker);
}

export const GET = withErrorHandlingV2<SimilarTicker[]>(getHandler);

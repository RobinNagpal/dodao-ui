import { FuturePerformanceResponse, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { fetchPerformanceCategoryByExchange } from '@/utils/performance-api-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<FuturePerformanceResponse> {
  const { spaceId, ticker, exchange } = await context.params;
  return fetchPerformanceCategoryByExchange(spaceId, ticker, exchange, TickerAnalysisCategory.FutureGrowth);
}

export const GET = withErrorHandlingV2<FuturePerformanceResponse>(getHandler);

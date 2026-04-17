import { BusinessAndMoatResponse, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { fetchPerformanceCategoryByTicker } from '@/utils/performance-api-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<BusinessAndMoatResponse> {
  const { spaceId, ticker } = await context.params;
  return fetchPerformanceCategoryByTicker(spaceId, ticker, TickerAnalysisCategory.BusinessAndMoat);
}

export const GET = withErrorHandlingV2<BusinessAndMoatResponse>(getHandler);

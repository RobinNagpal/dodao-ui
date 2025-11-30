import { GenerateStockMoversResponse } from '@/types/daily-stock-movers';
import { fetchTopLosers } from '@/utils/screener-api-utils';
import { processAndSaveStockMovers } from '@/utils/stock-movers-processing-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<GenerateStockMoversResponse> {
  const { spaceId } = await params;

  const data = await fetchTopLosers();
  return processAndSaveStockMovers(data, spaceId, 'loser');
}

export const GET = withErrorHandlingV2<GenerateStockMoversResponse>(getHandler);

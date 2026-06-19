import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { EtfCategoryDataResponse, fetchEtfCategoryByExchange } from '@/utils/etf-category-api-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(
  _req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfCategoryDataResponse> {
  const { spaceId, exchange, etf } = await context.params;
  return fetchEtfCategoryByExchange(spaceId, etf, exchange, EtfAnalysisCategory.FuturePerformanceOutlook);
}

export const GET = withErrorHandlingV2<EtfCategoryDataResponse>(getHandler);

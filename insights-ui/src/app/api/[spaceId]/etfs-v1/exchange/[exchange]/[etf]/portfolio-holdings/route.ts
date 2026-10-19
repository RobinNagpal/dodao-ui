import { EtfMorPortfolioHoldings } from '@/types/prismaTypes';
import { getEtfPortfolioHoldingsData } from '@/utils/etf-page-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfPortfolioHoldingsResponse {
  holdings: EtfMorPortfolioHoldings | null;
  /** When our pipeline last refreshed the portfolio info (ISO string). */
  updatedAt: string | null;
}

async function getHandler(
  _req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfPortfolioHoldingsResponse> {
  const { spaceId, exchange, etf } = await context.params;
  return getEtfPortfolioHoldingsData(spaceId, exchange, etf);
}

export const GET = withErrorHandlingV2<EtfPortfolioHoldingsResponse>(getHandler);

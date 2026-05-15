import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import { EtfMorPortfolioHoldings } from '@/types/prismaTypes';
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
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  if (!whereClause.symbol || !whereClause.exchange) {
    return { holdings: null, updatedAt: null };
  }

  const etfRecord = await prisma.etf.findFirst({
    where: { ...whereClause },
    select: { morPortfolioInfo: { select: { holdings: true, updatedAt: true } } },
  });

  const holdings = (etfRecord?.morPortfolioInfo?.holdings ?? null) as EtfMorPortfolioHoldings | null;
  const updatedAt = etfRecord?.morPortfolioInfo?.updatedAt?.toISOString() ?? null;
  return { holdings, updatedAt };
}

export const GET = withErrorHandlingV2<EtfPortfolioHoldingsResponse>(getHandler);

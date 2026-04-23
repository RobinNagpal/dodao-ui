import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import { EtfMorPortfolioHoldings } from '@/types/prismaTypes';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfPortfolioHoldingsResponse {
  holdings: EtfMorPortfolioHoldings | null;
}

async function getHandler(
  _req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfPortfolioHoldingsResponse> {
  const { spaceId, exchange, etf } = await context.params;
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  if (!whereClause.symbol || !whereClause.exchange) {
    return { holdings: null };
  }

  const etfRecord = await prisma.etf.findFirst({
    where: { ...whereClause },
    select: { morPortfolioInfo: { select: { holdings: true } } },
  });

  const holdings = (etfRecord?.morPortfolioInfo?.holdings ?? null) as EtfMorPortfolioHoldings | null;
  return { holdings };
}

export const GET = withErrorHandlingV2<EtfPortfolioHoldingsResponse>(getHandler);

import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface SimilarEtf {
  id: string;
  symbol: string;
  exchange: string;
  name: string;
}

const MAX_RESULTS = 6;

async function getHandler(_req: NextRequest, context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }): Promise<SimilarEtf[]> {
  const { spaceId, exchange, etf } = await context.params;
  const where = getEtfWhereClause({ spaceId, exchange, etf });

  const sourceEtf = await prisma.etf.findFirst({
    where,
    select: { id: true },
  });
  if (!sourceEtf) return [];

  const stored = await prisma.etfSimilarEtf.findMany({
    where: { sourceEtfId: sourceEtf.id },
    orderBy: { sortOrder: 'asc' },
    take: MAX_RESULTS,
  });

  return stored.map((s) => ({
    id: s.id,
    symbol: s.symbol,
    exchange: s.exchange,
    name: s.name || s.symbol,
  }));
}

export const GET = withErrorHandlingV2<SimilarEtf[]>(getHandler);

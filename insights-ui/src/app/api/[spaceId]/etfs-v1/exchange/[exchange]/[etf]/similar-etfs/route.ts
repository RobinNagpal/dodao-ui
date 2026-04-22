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
    select: { id: true, spaceId: true },
  });
  if (!sourceEtf) return [];

  const stored = await prisma.etfSimilarEtf.findMany({
    where: { sourceEtfId: sourceEtf.id },
    orderBy: { sortOrder: 'asc' },
    take: MAX_RESULTS,
  });
  if (stored.length === 0) return [];

  // Name lives on the main Etf row — look it up by (symbol, exchange).
  const etfs = await prisma.etf.findMany({
    where: {
      spaceId: sourceEtf.spaceId,
      OR: stored.map((s) => ({ symbol: s.symbol, exchange: s.exchange })),
    },
    select: { symbol: true, exchange: true, name: true },
  });
  const nameByKey: Map<string, string> = new Map<string, string>(etfs.map((e) => [`${e.symbol}|${e.exchange}`, e.name]));

  return stored.map((s) => ({
    id: s.id,
    symbol: s.symbol,
    exchange: s.exchange,
    name: nameByKey.get(`${s.symbol}|${s.exchange}`) ?? s.symbol,
  }));
}

export const GET = withErrorHandlingV2<SimilarEtf[]>(getHandler);

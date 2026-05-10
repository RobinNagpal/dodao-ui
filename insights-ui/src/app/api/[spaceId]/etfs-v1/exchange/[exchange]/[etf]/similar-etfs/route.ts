import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface SimilarEtf {
  id: string;
  symbol: string;
  exchange: string;
  name: string;
  // Financial detail fields — same set we surface on the ETF detail page header.
  aum: string | null;
  expenseRatio: number | null;
  pe: number | null;
  sharesOut: string | null;
  dividendTtm: number | null;
  dividendYield: number | null;
  payoutFrequency: string | null;
  payoutRatio: number | null;
  volume: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  beta: number | null;
  holdings: number | null;
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

  // Pull name + financial info for each peer in a single batched query.
  const etfs = await prisma.etf.findMany({
    where: {
      spaceId: sourceEtf.spaceId,
      OR: stored.map((s) => ({ symbol: s.symbol, exchange: s.exchange })),
    },
    select: {
      symbol: true,
      exchange: true,
      name: true,
      financialInfo: true,
    },
  });
  const byKey = new Map<string, (typeof etfs)[number]>(etfs.map((e) => [`${e.symbol}|${e.exchange}`, e]));

  return stored.map((s) => {
    const match = byKey.get(`${s.symbol}|${s.exchange}`);
    const fi = match?.financialInfo ?? null;
    return {
      id: s.id,
      symbol: s.symbol,
      exchange: s.exchange,
      name: match?.name ?? s.symbol,
      aum: fi?.aum ?? null,
      expenseRatio: fi?.expenseRatio ?? null,
      pe: fi?.pe ?? null,
      sharesOut: fi?.sharesOut ?? null,
      dividendTtm: fi?.dividendTtm ?? null,
      dividendYield: fi?.dividendYield ?? null,
      payoutFrequency: fi?.payoutFrequency ?? null,
      payoutRatio: fi?.payoutRatio ?? null,
      volume: fi?.volume ?? null,
      yearHigh: fi?.yearHigh ?? null,
      yearLow: fi?.yearLow ?? null,
      beta: fi?.beta ?? null,
      holdings: fi?.holdings ?? null,
    };
  });
}

export const GET = withErrorHandlingV2<SimilarEtf[]>(getHandler);

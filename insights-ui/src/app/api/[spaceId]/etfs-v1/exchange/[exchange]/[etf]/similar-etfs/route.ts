import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface SimilarEtf {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  reason: string | null;
  aum: string | null;
  category: string | null;
  assetClass: string | null;
  cachedScore: { finalScore: number } | null;
  inDb: boolean;
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
    include: {
      matchedEtf: {
        include: {
          financialInfo: true,
          stockAnalyzerInfo: true,
          cachedScore: true,
        },
      },
    },
  });

  // Show only ETFs that exist in our DB so the cards link to a real page
  // and can display score / AUM. The LLM is asked for at least 6, so most
  // should resolve.
  return stored
    .filter((s) => s.matchedEtf !== null)
    .slice(0, MAX_RESULTS)
    .map((s) => {
      const matched = s.matchedEtf!;
      return {
        id: matched.id,
        name: matched.name || s.name || s.symbol,
        symbol: matched.symbol,
        exchange: matched.exchange,
        reason: s.reason,
        aum: matched.financialInfo?.aum ?? null,
        category: matched.stockAnalyzerInfo?.category ?? null,
        assetClass: matched.stockAnalyzerInfo?.assetClass ?? null,
        cachedScore: matched.cachedScore ? { finalScore: matched.cachedScore.finalScore } : null,
        inDb: true,
      };
    });
}

export const GET = withErrorHandlingV2<SimilarEtf[]>(getHandler);

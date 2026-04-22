import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import { parseNumericStringValue } from '@/utils/etf-filter-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface SimilarEtf {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  aum: string | null;
  category: string | null;
  assetClass: string | null;
  cachedScore: { finalScore: number } | null;
}

const MAX_RESULTS = 6;
const CANDIDATE_LIMIT = 100;

async function getHandler(_req: NextRequest, context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }): Promise<SimilarEtf[]> {
  const { spaceId, exchange, etf } = await context.params;
  const where = getEtfWhereClause({ spaceId, exchange, etf });

  const etfRecord = await prisma.etf.findFirst({
    where,
    include: {
      financialInfo: true,
      stockAnalyzerInfo: true,
    },
  });
  if (!etfRecord) return [];

  const category: string | null = etfRecord.stockAnalyzerInfo?.category?.trim() || null;
  const assetClass: string | null = etfRecord.stockAnalyzerInfo?.assetClass?.trim() || null;

  // Use category if present, fallback to assetClass.
  const stockAnalyzerInfoFilter: Prisma.EtfStockAnalyzerInfoWhereInput | null = category
    ? { category: { equals: category, mode: 'insensitive' } }
    : assetClass
    ? { assetClass: { equals: assetClass, mode: 'insensitive' } }
    : null;

  if (!stockAnalyzerInfoFilter) return [];

  const candidates = await prisma.etf.findMany({
    where: {
      spaceId: where.spaceId,
      id: { not: etfRecord.id },
      stockAnalyzerInfo: { is: stockAnalyzerInfoFilter },
    },
    include: {
      financialInfo: true,
      stockAnalyzerInfo: true,
      cachedScore: true,
    },
    take: CANDIDATE_LIMIT,
  });

  const currentAum: number | null = parseNumericStringValue(etfRecord.financialInfo?.aum);

  // Rank by AUM proximity when both sides have a parseable AUM; otherwise push to the end.
  const ranked = candidates
    .map((c) => {
      const aumNum: number | null = parseNumericStringValue(c.financialInfo?.aum);
      const distance: number = currentAum !== null && aumNum !== null ? Math.abs(aumNum - currentAum) : Number.POSITIVE_INFINITY;
      return { etf: c, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_RESULTS);

  return ranked.map((r) => ({
    id: r.etf.id,
    name: r.etf.name,
    symbol: r.etf.symbol,
    exchange: r.etf.exchange,
    aum: r.etf.financialInfo?.aum ?? null,
    category: r.etf.stockAnalyzerInfo?.category ?? null,
    assetClass: r.etf.stockAnalyzerInfo?.assetClass ?? null,
    cachedScore: r.etf.cachedScore ? { finalScore: r.etf.cachedScore.finalScore } : null,
  }));
}

export const GET = withErrorHandlingV2<SimilarEtf[]>(getHandler);

import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { getExchangeFilterClause, toSupportedCountry } from '@/utils/countryExchangeUtils';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TickerWithIndustryNames[]> {
  const { spaceId } = await context.params;

  const url = new URL(req.url);
  const industryKey = url.searchParams.get('industryKey');
  const country = toSupportedCountry(url.searchParams.get('country'));

  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
    ...(industryKey ? { industryKey } : {}),
    ...getExchangeFilterClause(country),
    cachedScoreEntry: {
      finalScore: {
        gt: 10,
      },
    },
  };

  // Single DB query: order so we can take the first 4 per industry in memory.
  const tickers = await prisma.tickerV1.findMany({
    where: whereClause,
    include: {
      cachedScoreEntry: true,
      industry: true,
      subIndustry: true,
    },
    orderBy: [
      // within each industry, highest final score first (nulls last naturally)
      { cachedScoreEntry: { finalScore: 'desc' } },
      // tiebreakers for stability
      { symbol: 'asc' },
    ],
  });

  // Take top 4 per industry
  const countsByIndustry: Record<string, number> = {};
  const topPerIndustry: typeof tickers = [];

  for (const t of tickers) {
    const key = t.industryKey;
    const count = countsByIndustry[key] ?? 0;
    if (count < 4) {
      topPerIndustry.push(t);
      countsByIndustry[key] = count + 1;
    }
  }

  // Attach friendly names while preserving the included relations
  return topPerIndustry.map((t) => ({
    ...t,
    industryName: t.industry.name,
    subIndustryName: t.subIndustry.name,
  }));
}

export const GET = withErrorHandlingV2<TickerWithIndustryNames[]>(getHandler);

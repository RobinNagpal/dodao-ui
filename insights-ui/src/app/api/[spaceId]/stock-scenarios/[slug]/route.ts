import { prisma } from '@/prisma';
import { ScenarioDirection, ScenarioPricedInBucket, ScenarioProbabilityBucket, ScenarioRole, ScenarioTimeframe } from '@/types/scenarioEnums';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { StockScenario, StockScenarioStockLink } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface StockScenarioLinkDto {
  symbol: string;
  exchange: string;
  tickerId: string | null;
  role: ScenarioRole;
  sortOrder: number;
  roleExplanation: string | null;
  expectedPriceChange: number | null;
  expectedPriceChangeExplanation: string | null;
  pricedInBucket: ScenarioPricedInBucket;
  marketCap: number | null;
  pe: number | null;
  finalScore: number | null;
}

interface ResolvedTicker {
  tickerId: string;
  marketCap: number | null;
  pe: number | null;
  finalScore: number | null;
}

export interface StockScenarioDetail
  extends Omit<StockScenario, 'outlookAsOfDate' | 'createdAt' | 'updatedAt' | 'direction' | 'timeframe' | 'probabilityBucket' | 'countries'> {
  direction: ScenarioDirection;
  timeframe: ScenarioTimeframe;
  probabilityBucket: ScenarioProbabilityBucket;
  countries: SupportedCountries[];
  outlookAsOfDate: string;
  createdAt: string;
  updatedAt: string;
  winners: StockScenarioLinkDto[];
  losers: StockScenarioLinkDto[];
  mostExposed: StockScenarioLinkDto[];
}

function toLinkDto(link: StockScenarioStockLink, resolved: ResolvedTicker | undefined): StockScenarioLinkDto {
  return {
    symbol: link.symbol,
    exchange: link.exchange,
    tickerId: link.tickerId ?? resolved?.tickerId ?? null,
    role: link.role as ScenarioRole,
    sortOrder: link.sortOrder,
    roleExplanation: link.roleExplanation,
    expectedPriceChange: link.expectedPriceChange,
    expectedPriceChangeExplanation: link.expectedPriceChangeExplanation,
    pricedInBucket: link.pricedInBucket as ScenarioPricedInBucket,
    marketCap: resolved?.marketCap ?? null,
    pe: resolved?.pe ?? null,
    finalScore: resolved?.finalScore ?? null,
  };
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; slug: string }> }): Promise<StockScenarioDetail | null> {
  const { spaceId, slug } = await context.params;
  const { searchParams } = new URL(req.url);
  const allowNull = searchParams.get('allowNull') === 'true';

  const scenario = await prisma.stockScenario.findUnique({
    where: { spaceId_slug: { spaceId, slug } },
    include: { stockLinks: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!scenario) {
    if (allowNull) return null;
    throw new Error(`Scenario not found: ${slug}`);
  }

  const { stockLinks, outlookAsOfDate, createdAt, updatedAt, countries, ...rest } = scenario;

  // Bulk-fetch every link's TickerV1 row (matches the unique constraint
  // `@@unique([spaceId, symbol, exchange])` on tickers_v1) so we can:
  //   1. resolve `tickerId` for legacy links that saved with tickerId=null
  //   2. surface market cap / PE / final score on the link cards
  // One query covers all links — no N+1, no per-link round-trips.
  const linkKeys = stockLinks.map((l) => ({ symbol: l.symbol.toUpperCase(), exchange: l.exchange.toUpperCase() }));

  const resolved = new Map<string, ResolvedTicker>();
  if (linkKeys.length) {
    const tickers = await prisma.tickerV1.findMany({
      where: { spaceId, OR: linkKeys },
      select: {
        id: true,
        symbol: true,
        exchange: true,
        financialInfo: { select: { marketCap: true, pe: true } },
        cachedScoreEntry: { select: { finalScore: true } },
      },
    });
    for (const t of tickers) {
      resolved.set(`${t.symbol.toUpperCase()}|${t.exchange.toUpperCase()}`, {
        tickerId: t.id,
        marketCap: t.financialInfo?.marketCap ?? null,
        pe: t.financialInfo?.pe ?? null,
        finalScore: t.cachedScoreEntry?.finalScore ?? null,
      });
    }
  }

  const mapLink = (l: StockScenarioStockLink) => {
    const key = `${l.symbol.toUpperCase()}|${l.exchange.toUpperCase()}`;
    return toLinkDto(l, resolved.get(key));
  };

  return {
    ...rest,
    direction: rest.direction as ScenarioDirection,
    timeframe: rest.timeframe as ScenarioTimeframe,
    probabilityBucket: rest.probabilityBucket as ScenarioProbabilityBucket,
    countries: countries as SupportedCountries[],
    outlookAsOfDate: outlookAsOfDate.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    winners: stockLinks.filter((l) => l.role === 'WINNER').map(mapLink),
    losers: stockLinks.filter((l) => l.role === 'LOSER').map(mapLink),
    mostExposed: stockLinks.filter((l) => l.role === 'MOST_EXPOSED').map(mapLink),
  };
}

export const GET = withErrorHandlingV2<StockScenarioDetail | null>(getHandler);

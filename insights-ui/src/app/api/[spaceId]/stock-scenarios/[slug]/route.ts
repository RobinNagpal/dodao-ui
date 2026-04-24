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
}

export interface StockScenarioDetail
  extends Omit<
    StockScenario,
    'outlookAsOfDate' | 'createdAt' | 'updatedAt' | 'direction' | 'timeframe' | 'probabilityBucket' | 'pricedInBucket' | 'countries'
  > {
  direction: ScenarioDirection;
  timeframe: ScenarioTimeframe;
  probabilityBucket: ScenarioProbabilityBucket;
  pricedInBucket: ScenarioPricedInBucket;
  countries: SupportedCountries[];
  outlookAsOfDate: string;
  createdAt: string;
  updatedAt: string;
  winners: StockScenarioLinkDto[];
  losers: StockScenarioLinkDto[];
  mostExposed: StockScenarioLinkDto[];
}

function toLinkDto(link: StockScenarioStockLink, resolvedTickerId?: string | null): StockScenarioLinkDto {
  return {
    symbol: link.symbol,
    exchange: link.exchange,
    tickerId: link.tickerId ?? resolvedTickerId ?? null,
    role: link.role as ScenarioRole,
    sortOrder: link.sortOrder,
    roleExplanation: link.roleExplanation,
    expectedPriceChange: link.expectedPriceChange,
    expectedPriceChangeExplanation: link.expectedPriceChangeExplanation,
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

  // Resolve any links that don't have `tickerId` set yet against the TickerV1
  // table by (symbol, exchange) — matches the unique constraint
  // `@@unique([spaceId, symbol, exchange])` on tickers_v1.
  const unresolved = stockLinks
    .filter((l) => !l.tickerId)
    .map((l) => ({ symbol: l.symbol.toUpperCase(), exchange: l.exchange.toUpperCase() }));

  const resolved = new Map<string, string>();
  if (unresolved.length) {
    const tickers = await prisma.tickerV1.findMany({
      where: {
        spaceId,
        OR: unresolved.map((u) => ({ symbol: u.symbol, exchange: u.exchange })),
      },
      select: { id: true, symbol: true, exchange: true },
    });
    for (const t of tickers) {
      resolved.set(`${t.symbol.toUpperCase()}|${t.exchange.toUpperCase()}`, t.id);
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
    pricedInBucket: rest.pricedInBucket as ScenarioPricedInBucket,
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

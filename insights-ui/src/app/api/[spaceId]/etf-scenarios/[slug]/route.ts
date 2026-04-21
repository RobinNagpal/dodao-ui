import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfScenario, EtfScenarioEtfLink } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioPricedInBucket, EtfScenarioProbabilityBucket, EtfScenarioRole, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { NextRequest } from 'next/server';

export interface EtfScenarioLinkDto {
  symbol: string;
  exchange: string | null;
  etfId: string | null;
  role: EtfScenarioRole;
  sortOrder: number;
}

export interface EtfScenarioDetail
  extends Omit<EtfScenario, 'outlookAsOfDate' | 'createdAt' | 'updatedAt' | 'direction' | 'timeframe' | 'probabilityBucket' | 'pricedInBucket'> {
  direction: EtfScenarioDirection;
  timeframe: EtfScenarioTimeframe;
  probabilityBucket: EtfScenarioProbabilityBucket;
  pricedInBucket: EtfScenarioPricedInBucket;
  outlookAsOfDate: string;
  createdAt: string;
  updatedAt: string;
  winners: EtfScenarioLinkDto[];
  losers: EtfScenarioLinkDto[];
  mostExposed: EtfScenarioLinkDto[];
}

function toLinkDto(link: EtfScenarioEtfLink, resolved?: { id: string; exchange: string }): EtfScenarioLinkDto {
  return {
    symbol: link.symbol,
    exchange: link.exchange ?? resolved?.exchange ?? null,
    etfId: link.etfId ?? resolved?.id ?? null,
    role: link.role as EtfScenarioRole,
    sortOrder: link.sortOrder,
  };
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; slug: string }> }): Promise<EtfScenarioDetail | null> {
  const { spaceId, slug } = await context.params;
  const { searchParams } = new URL(req.url);
  const allowNull = searchParams.get('allowNull') === 'true';

  const scenario = await prisma.etfScenario.findUnique({
    where: { spaceId_slug: { spaceId, slug } },
    include: { etfLinks: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!scenario) {
    if (allowNull) return null;
    throw new Error(`Scenario not found: ${slug}`);
  }

  const { etfLinks, outlookAsOfDate, createdAt, updatedAt, ...rest } = scenario;

  const unresolvedSymbols = Array.from(new Set(etfLinks.filter((l) => !l.etfId || !l.exchange).map((l) => l.symbol.toUpperCase())));
  const resolvedBySymbol = new Map<string, { id: string; exchange: string }>();
  if (unresolvedSymbols.length) {
    const matches = await prisma.etf.findMany({
      where: { spaceId, symbol: { in: unresolvedSymbols } },
      select: { id: true, symbol: true, exchange: true },
    });
    for (const etf of matches) {
      const key = etf.symbol.toUpperCase();
      if (!resolvedBySymbol.has(key)) resolvedBySymbol.set(key, { id: etf.id, exchange: etf.exchange });
    }
  }

  const mapLink = (l: EtfScenarioEtfLink) => toLinkDto(l, resolvedBySymbol.get(l.symbol.toUpperCase()));

  return {
    ...rest,
    direction: rest.direction as EtfScenarioDirection,
    timeframe: rest.timeframe as EtfScenarioTimeframe,
    probabilityBucket: rest.probabilityBucket as EtfScenarioProbabilityBucket,
    pricedInBucket: rest.pricedInBucket as EtfScenarioPricedInBucket,
    outlookAsOfDate: outlookAsOfDate.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    winners: etfLinks.filter((l) => l.role === 'WINNER').map(mapLink),
    losers: etfLinks.filter((l) => l.role === 'LOSER').map(mapLink),
    mostExposed: etfLinks.filter((l) => l.role === 'MOST_EXPOSED').map(mapLink),
  };
}

export const GET = withErrorHandlingV2<EtfScenarioDetail | null>(getHandler);

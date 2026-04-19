import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfScenario, EtfScenarioEtfLink } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioProbabilityBucket, EtfScenarioRole, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { NextRequest } from 'next/server';

export interface EtfScenarioLinkDto {
  symbol: string;
  exchange: string | null;
  etfId: string | null;
  role: EtfScenarioRole;
  sortOrder: number;
}

export interface EtfScenarioDetail extends Omit<EtfScenario, 'outlookAsOfDate' | 'createdAt' | 'updatedAt' | 'direction' | 'timeframe' | 'probabilityBucket'> {
  direction: EtfScenarioDirection;
  timeframe: EtfScenarioTimeframe;
  probabilityBucket: EtfScenarioProbabilityBucket;
  outlookAsOfDate: string;
  createdAt: string;
  updatedAt: string;
  winners: EtfScenarioLinkDto[];
  losers: EtfScenarioLinkDto[];
  mostExposed: EtfScenarioLinkDto[];
}

function toLinkDto(link: EtfScenarioEtfLink): EtfScenarioLinkDto {
  return {
    symbol: link.symbol,
    exchange: link.exchange,
    etfId: link.etfId,
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

  return {
    ...rest,
    direction: rest.direction as EtfScenarioDirection,
    timeframe: rest.timeframe as EtfScenarioTimeframe,
    probabilityBucket: rest.probabilityBucket as EtfScenarioProbabilityBucket,
    outlookAsOfDate: outlookAsOfDate.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    winners: etfLinks.filter((l) => l.role === 'WINNER').map(toLinkDto),
    losers: etfLinks.filter((l) => l.role === 'LOSER').map(toLinkDto),
    mostExposed: etfLinks.filter((l) => l.role === 'MOST_EXPOSED').map(toLinkDto),
  };
}

export const GET = withErrorHandlingV2<EtfScenarioDetail | null>(getHandler);

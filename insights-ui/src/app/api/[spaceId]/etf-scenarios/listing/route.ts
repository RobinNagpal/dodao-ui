import { prisma } from '@/prisma';
import { toSupportedCountry } from '@/utils/countryExchangeUtils';
import { getEtfExchangesByCountry } from '@/utils/etfCountryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioProbabilityBucket, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { NextRequest } from 'next/server';

const DEFAULT_PAGE_SIZE = 32;

export interface EtfScenarioListingItem {
  id: string;
  scenarioNumber: number;
  title: string;
  slug: string;
  direction: EtfScenarioDirection;
  timeframe: EtfScenarioTimeframe;
  probabilityBucket: EtfScenarioProbabilityBucket;
  probabilityPercentage: number | null;
  outlookAsOfDate: string;
  underlyingCause: string;
  archived: boolean;
}

export interface EtfScenarioListingResponse {
  scenarios: EtfScenarioListingItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filtersApplied: boolean;
}

function isDirection(value: string | null): value is EtfScenarioDirection {
  return value === 'UPSIDE' || value === 'DOWNSIDE';
}

function isTimeframe(value: string | null): value is EtfScenarioTimeframe {
  return value === 'FUTURE' || value === 'IN_PROGRESS' || value === 'PAST';
}

function isProbabilityBucket(value: string | null): value is EtfScenarioProbabilityBucket {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW';
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfScenarioListingResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)));

  const directionParam = searchParams.get('direction');
  const timeframeParam = searchParams.get('timeframe');
  const bucketParam = searchParams.get('probabilityBucket');
  const search = searchParams.get('search')?.trim() || null;
  const includeArchivedParam = searchParams.get('includeArchived');
  const includeArchived = includeArchivedParam === 'true';
  const country = toSupportedCountry(searchParams.get('country'));

  const where: Prisma.EtfScenarioWhereInput = {
    spaceId,
    ...(includeArchived ? {} : { archived: false }),
  };

  if (isDirection(directionParam)) where.direction = directionParam;
  if (isTimeframe(timeframeParam)) where.timeframe = timeframeParam;
  if (isProbabilityBucket(bucketParam)) where.probabilityBucket = bucketParam;
  if (country) {
    // Country isn't stored on the scenario row — derive it via the link
    // exchanges. A scenario shows up under "Canada" iff it has at least one
    // link on a Canadian ETF exchange (TSX/TSXV/NEOE).
    const exchanges = getEtfExchangesByCountry(country);
    if (exchanges.length) where.etfLinks = { some: { exchange: { in: exchanges } } };
  }

  if (search) {
    where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { underlyingCause: { contains: search, mode: 'insensitive' } }];
  }

  const filtersApplied = !!directionParam || !!timeframeParam || !!bucketParam || !!search || !!country;

  const [scenarios, totalCount] = await Promise.all([
    prisma.etfScenario.findMany({
      where,
      orderBy: [{ scenarioNumber: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        scenarioNumber: true,
        title: true,
        slug: true,
        direction: true,
        timeframe: true,
        probabilityBucket: true,
        probabilityPercentage: true,
        outlookAsOfDate: true,
        underlyingCause: true,
        archived: true,
      },
    }),
    prisma.etfScenario.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    scenarios: scenarios.map((s) => ({
      id: s.id,
      scenarioNumber: s.scenarioNumber,
      title: s.title,
      slug: s.slug,
      direction: s.direction as EtfScenarioDirection,
      timeframe: s.timeframe as EtfScenarioTimeframe,
      probabilityBucket: s.probabilityBucket as EtfScenarioProbabilityBucket,
      probabilityPercentage: s.probabilityPercentage,
      outlookAsOfDate: s.outlookAsOfDate.toISOString(),
      underlyingCause: s.underlyingCause,
      archived: s.archived,
    })),
    totalCount,
    page,
    pageSize,
    totalPages,
    filtersApplied,
  };
}

export const GET = withErrorHandlingV2<EtfScenarioListingResponse>(getHandler);

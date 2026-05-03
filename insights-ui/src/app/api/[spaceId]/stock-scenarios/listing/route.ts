import { prisma } from '@/prisma';
import { ScenarioDirection, ScenarioProbabilityBucket, ScenarioTimeframe } from '@/types/scenarioEnums';
import { SupportedCountries, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

const DEFAULT_PAGE_SIZE = 32;

export interface StockScenarioListingItem {
  id: string;
  scenarioNumber: number;
  title: string;
  slug: string;
  direction: ScenarioDirection;
  timeframe: ScenarioTimeframe;
  probabilityBucket: ScenarioProbabilityBucket;
  probabilityPercentage: number | null;
  countries: SupportedCountries[];
  outlookAsOfDate: string;
  summary: string;
  archived: boolean;
}

export interface StockScenarioListingResponse {
  scenarios: StockScenarioListingItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filtersApplied: boolean;
}

function isDirection(value: string | null): value is ScenarioDirection {
  return value === 'UPSIDE' || value === 'DOWNSIDE';
}

function isTimeframe(value: string | null): value is ScenarioTimeframe {
  return value === 'FUTURE' || value === 'IN_PROGRESS' || value === 'PAST';
}

function isProbabilityBucket(value: string | null): value is ScenarioProbabilityBucket {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW';
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<StockScenarioListingResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)));

  const directionParam = searchParams.get('direction');
  const timeframeParam = searchParams.get('timeframe');
  const bucketParam = searchParams.get('probabilityBucket');
  const search = searchParams.get('search')?.trim() || null;
  const includeArchived = searchParams.get('includeArchived') === 'true';
  const country = toSupportedCountry(searchParams.get('country'));

  const where: Prisma.StockScenarioWhereInput = {
    spaceId,
    ...(includeArchived ? {} : { archived: false }),
  };

  if (isDirection(directionParam)) where.direction = directionParam;
  if (isTimeframe(timeframeParam)) where.timeframe = timeframeParam;
  if (isProbabilityBucket(bucketParam)) where.probabilityBucket = bucketParam;
  if (country) where.countries = { has: country };

  if (search) {
    where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { summary: { contains: search, mode: 'insensitive' } }];
  }

  const filtersApplied = !!directionParam || !!timeframeParam || !!bucketParam || !!search || !!country;

  const [scenarios, totalCount] = await Promise.all([
    prisma.stockScenario.findMany({
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
        countries: true,
        outlookAsOfDate: true,
        summary: true,
        archived: true,
      },
    }),
    prisma.stockScenario.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    scenarios: scenarios.map((s) => ({
      id: s.id,
      scenarioNumber: s.scenarioNumber,
      title: s.title,
      slug: s.slug,
      direction: s.direction as ScenarioDirection,
      timeframe: s.timeframe as ScenarioTimeframe,
      probabilityBucket: s.probabilityBucket as ScenarioProbabilityBucket,
      probabilityPercentage: s.probabilityPercentage,
      countries: s.countries as SupportedCountries[],
      outlookAsOfDate: s.outlookAsOfDate.toISOString(),
      summary: s.summary,
      archived: s.archived,
    })),
    totalCount,
    page,
    pageSize,
    totalPages,
    filtersApplied,
  };
}

export const GET = withErrorHandlingV2<StockScenarioListingResponse>(getHandler);

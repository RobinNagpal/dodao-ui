import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfScenarioOutlookBucket, Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

const DEFAULT_PAGE_SIZE = 32;

export interface EtfScenarioListingItem {
  id: string;
  scenarioNumber: number;
  title: string;
  slug: string;
  outlookBucket: EtfScenarioOutlookBucket;
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

function isOutlookBucket(value: string | null): value is EtfScenarioOutlookBucket {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW' || value === 'IN_PROGRESS';
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfScenarioListingResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)));

  const bucketParam = searchParams.get('outlookBucket');
  const search = searchParams.get('search')?.trim() || null;
  const includeArchivedParam = searchParams.get('includeArchived');
  const includeArchived = includeArchivedParam === 'true';

  const where: Prisma.EtfScenarioWhereInput = {
    spaceId,
    ...(includeArchived ? {} : { archived: false }),
  };

  if (isOutlookBucket(bucketParam)) {
    where.outlookBucket = bucketParam;
  }

  if (search) {
    where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { underlyingCause: { contains: search, mode: 'insensitive' } }];
  }

  const filtersApplied = !!bucketParam || !!search;

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
        outlookBucket: true,
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
      outlookBucket: s.outlookBucket,
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

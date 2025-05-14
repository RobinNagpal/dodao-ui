import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { SecFiling } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<SecFiling[]> {
  const { tickerKey } = await params;

  // 1) parse page, default to 1
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const pageSize = 50;

  // 2) calculate how many to skip
  const skip = (page - 1) * pageSize;

  // 3) fetch only that slice
  const filings = await prisma.secFiling.findMany({
    where: { tickerKey, spaceId: KoalaGainsSpaceId },
    orderBy: { filingDate: 'desc' },
    skip,
    take: pageSize,
  });
  return filings;
}

export const GET = withErrorHandlingV2<SecFiling[]>(getHandler);

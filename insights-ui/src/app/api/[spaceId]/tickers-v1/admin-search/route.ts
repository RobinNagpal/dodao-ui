import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { getReportStatusForTickerIds, TickerWithMissingReportInfoExtended } from '@/utils/missing-reports-utils';
import { createTickerSearchWhere, parseTickerSearchParams } from '@/utils/ticker-search-utils';
import { NextRequest } from 'next/server';

export interface AdminTickerSearchResponse {
  tickers: TickerWithMissingReportInfoExtended[];
  totalCount: number;
  skip: number;
  take: number;
}

/**
 * Paginated admin ticker search with per-ticker report status, backing the
 * create-reports and missing-reports screens. Accepts every public stock
 * filter param plus the admin narrowing in `ticker-search-utils`. (The public
 * autocomplete lives at `/search`.)
 */
async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<AdminTickerSearchResponse> {
  const { spaceId } = await params;
  const searchParams = parseTickerSearchParams(req);
  const where = createTickerSearchWhere(spaceId, searchParams);

  const [tickers, totalCount] = await Promise.all([
    prisma.tickerV1.findMany({
      where,
      include: {
        industry: { select: { name: true, industryKey: true } },
        subIndustry: { select: { name: true, subIndustryKey: true } },
        cachedScoreEntry: true,
      },
      orderBy: [{ symbol: 'asc' }, { exchange: 'asc' }],
      skip: searchParams.skip,
      take: searchParams.take,
    }),
    prisma.tickerV1.count({ where }),
  ]);

  // One status query for the whole page instead of one per ticker.
  const statusRows = await getReportStatusForTickerIds(
    spaceId,
    tickers.map((ticker) => ticker.id)
  );
  const statusById = new Map(statusRows.map((row) => [row.id, row]));

  const withStatus: TickerWithMissingReportInfoExtended[] = tickers.flatMap((ticker) => {
    const status = statusById.get(ticker.id);
    return status ? [{ ...ticker, ...status }] : [];
  });

  return { tickers: withStatus, totalCount, skip: searchParams.skip, take: searchParams.take };
}

export const GET = withLoggedInAdmin<AdminTickerSearchResponse>(getHandler);

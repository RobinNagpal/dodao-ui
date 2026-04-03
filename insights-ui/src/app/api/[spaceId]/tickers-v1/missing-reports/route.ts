// insights-ui/src/app/api/[spaceId]/tickers-v1/missing-reports/route.ts
import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { getTickersWithMissingReports, MissingReportsDateFilters, TickerWithMissingReportInfoExtended } from '@/utils/missing-reports-utils';
import { NextRequest } from 'next/server';

const getHandler = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<TickerWithMissingReportInfoExtended[]> => {
  const { spaceId } = await params;
  const { searchParams } = req.nextUrl;

  const dateFilters: MissingReportsDateFilters = {};
  const businessAndMoatBefore = searchParams.get('businessAndMoatBefore');
  const fairValueBefore = searchParams.get('fairValueBefore');

  if (businessAndMoatBefore) dateFilters.businessAndMoatBefore = businessAndMoatBefore;
  if (fairValueBefore) dateFilters.fairValueBefore = fairValueBefore;

  return getTickersWithMissingReports(spaceId, dateFilters);
};

export const GET = withLoggedInAdmin<TickerWithMissingReportInfoExtended[]>(getHandler);

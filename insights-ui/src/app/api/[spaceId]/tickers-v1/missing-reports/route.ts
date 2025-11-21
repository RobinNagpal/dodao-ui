// insights-ui/src/app/api/[spaceId]/tickers-v1/missing-reports/route.ts
import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { getTickersWithMissingReports, TickerWithMissingReportInfoExtended } from '@/utils/missing-reports-utils';
import { NextRequest } from 'next/server';

const getHandler = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<TickerWithMissingReportInfoExtended[]> => {
  const { spaceId } = await params;
  return getTickersWithMissingReports(spaceId);
};

export const GET = withLoggedInAdmin<TickerWithMissingReportInfoExtended[]>(getHandler);

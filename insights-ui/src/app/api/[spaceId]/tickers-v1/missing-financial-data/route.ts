import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { TickerWithMissingFinancialData } from '@/utils/missing-financial-data-utils';
import { getTickersWithMissingFinancialData } from '@/utils/missing-financial-data-utils';
import { NextRequest } from 'next/server';

const getHandler = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<TickerWithMissingFinancialData[]> => {
  const { spaceId } = await params;
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const take = parseInt(searchParams.get('take') || '50', 10);

  const allTickers = await getTickersWithMissingFinancialData(spaceId);
  return allTickers.slice(skip, skip + take);
};

export const GET = withLoggedInAdmin<TickerWithMissingFinancialData[]>(getHandler);

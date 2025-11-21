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

  return await getTickersWithMissingFinancialData(spaceId);
};

export const GET = withLoggedInAdmin<TickerWithMissingFinancialData[]>(getHandler);

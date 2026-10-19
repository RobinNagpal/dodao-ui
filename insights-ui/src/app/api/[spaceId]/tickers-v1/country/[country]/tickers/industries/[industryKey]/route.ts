import { SubIndustriesResponse } from '@/types/api/ticker-industries';
import { toSupportedCountry } from '@/utils/countryExchangeUtils';
import { parseFilterParams } from '@/utils/ticker-filter-utils';
import { getCountryIndustryStocks } from '@/utils/ticker-v1-page-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; country: string; industryKey: string }> }
): Promise<SubIndustriesResponse | null> {
  const { spaceId, country: countryParam, industryKey } = await context.params;
  return getCountryIndustryStocks(spaceId, toSupportedCountry(countryParam), industryKey, parseFilterParams(req));
}

export const GET = withErrorHandlingV2<SubIndustriesResponse | null>(getHandler);

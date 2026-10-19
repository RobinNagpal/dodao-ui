import { IndustriesResponse } from '@/types/api/ticker-industries';
import { toSupportedCountry } from '@/utils/countryExchangeUtils';
import { parseFilterParams } from '@/utils/ticker-filter-utils';
import { getCountryIndustriesWithTopTickers } from '@/utils/ticker-v1-page-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; country: string }> }): Promise<IndustriesResponse> {
  const { spaceId, country: countryParam } = await context.params;
  return getCountryIndustriesWithTopTickers(spaceId, toSupportedCountry(countryParam), parseFilterParams(req));
}

export const GET = withErrorHandlingV2<IndustriesResponse>(getHandler);

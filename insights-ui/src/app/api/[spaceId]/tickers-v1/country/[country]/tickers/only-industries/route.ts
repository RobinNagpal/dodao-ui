import { OnlyIndustriesResponse } from '@/types/api/ticker-industries';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getTopIndustriesWithTickers } from '@/utils/home-page/top-industries';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; country: string }> }): Promise<OnlyIndustriesResponse> {
  const { spaceId } = await context.params;

  // Behavior preserved: this endpoint has always filtered on US exchanges regardless of the
  // `country` path param. The shared query now lives in getTopIndustriesWithTickers().
  return getTopIndustriesWithTickers(spaceId, SupportedCountries.US);
}

export const GET = withErrorHandlingV2<OnlyIndustriesResponse>(getHandler);

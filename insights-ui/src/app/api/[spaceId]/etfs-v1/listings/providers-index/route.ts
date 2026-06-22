import { EtfProvidersPreview, fetchEtfProvidersForCountry } from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { shouldIncludeUnpopulatedForRequest } from '@/utils/etf-listing-visibility';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export type EtfProvidersIndexResponse = EtfProvidersPreview;

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfProvidersIndexResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country')?.trim();
  const country = countryParam && isEtfSupportedCountry(countryParam) ? countryParam : undefined;
  const includeUnpopulated = await shouldIncludeUnpopulatedForRequest(req);

  return fetchEtfProvidersForCountry(spaceId, country, includeUnpopulated);
}

export const GET = withErrorHandlingV2<EtfProvidersIndexResponse>(getHandler);

import {
  EtfProvidersPreview,
  EtfUncategorizedPreview,
  fetchEtfProvidersForCountry,
  fetchEtfsWithoutIssuer,
} from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { shouldIncludeUnpopulatedForRequest } from '@/utils/etf-listing-visibility';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/** Provider buckets plus an "Others" bucket for ETFs with no issuer. */
export type EtfProvidersIndexResponse = EtfProvidersPreview & { others: EtfUncategorizedPreview };

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfProvidersIndexResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country')?.trim();
  const country = countryParam && isEtfSupportedCountry(countryParam) ? countryParam : undefined;
  const includeUnpopulated = await shouldIncludeUnpopulatedForRequest(req);

  const [providers, others] = await Promise.all([
    fetchEtfProvidersForCountry(spaceId, country, includeUnpopulated),
    fetchEtfsWithoutIssuer(spaceId, country, includeUnpopulated),
  ]);

  return { ...providers, others };
}

export const GET = withErrorHandlingV2<EtfProvidersIndexResponse>(getHandler);

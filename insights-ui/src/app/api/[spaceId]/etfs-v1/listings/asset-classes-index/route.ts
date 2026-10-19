import { EtfGroupingPreview, EtfUncategorizedPreview, getEtfAssetClassesIndexData } from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { shouldIncludeUnpopulatedForRequest } from '@/utils/etf-listing-visibility';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfAssetClassesIndexResponse {
  values: EtfGroupingPreview['values'];
  counts: EtfGroupingPreview['counts'];
  /** ETFs with no asset class, surfaced as an "Others" bucket. */
  others: EtfUncategorizedPreview;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfAssetClassesIndexResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country')?.trim();
  const country = countryParam && isEtfSupportedCountry(countryParam) ? countryParam : undefined;
  const includeUnpopulated = await shouldIncludeUnpopulatedForRequest(req);

  return getEtfAssetClassesIndexData(spaceId, country, includeUnpopulated);
}

export const GET = withErrorHandlingV2<EtfAssetClassesIndexResponse>(getHandler);

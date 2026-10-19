import { EtfGroupingPreview, EtfUncategorizedPreview, getEtfGroupDetailData } from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { shouldIncludeUnpopulatedForRequest } from '@/utils/etf-listing-visibility';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfGroupDetailResponse {
  found: boolean;
  // Populated when found && group !== "others".
  values: EtfGroupingPreview['values'];
  counts: EtfGroupingPreview['counts'];
  // Populated when group === "others".
  others: EtfUncategorizedPreview | null;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfGroupDetailResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country')?.trim();
  const country = countryParam && isEtfSupportedCountry(countryParam) ? countryParam : undefined;
  const groupKey = searchParams.get('groupKey')?.trim();
  const includeUnpopulated = await shouldIncludeUnpopulatedForRequest(req);

  return getEtfGroupDetailData(spaceId, country, groupKey, includeUnpopulated);
}

export const GET = withErrorHandlingV2<EtfGroupDetailResponse>(getHandler);

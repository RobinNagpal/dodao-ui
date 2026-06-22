import {
  EtfGroupingPreview,
  EtfUncategorizedPreview,
  fetchAllEtfsByCategory,
  fetchUncategorizedEtfPreview,
} from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { ETF_OTHERS_GROUP_KEY, getCategoriesForGroupKey, getEtfGroupByKey } from '@/utils/etf-categorization-utils';
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

  if (!groupKey) {
    return { found: false, values: {}, counts: {}, others: null };
  }

  const groupObj = getEtfGroupByKey(groupKey);
  if (!groupObj) {
    return { found: false, values: {}, counts: {}, others: null };
  }

  if (groupObj.key === ETF_OTHERS_GROUP_KEY) {
    const others = await fetchUncategorizedEtfPreview(spaceId, country, includeUnpopulated);
    return { found: true, values: {}, counts: {}, others };
  }

  const categories = getCategoriesForGroupKey(groupObj.key);
  const categoryNames = categories.map((c) => c.name);
  const { values, counts } = await fetchAllEtfsByCategory(spaceId, categoryNames, country, includeUnpopulated);

  return { found: true, values, counts, others: null };
}

export const GET = withErrorHandlingV2<EtfGroupDetailResponse>(getHandler);

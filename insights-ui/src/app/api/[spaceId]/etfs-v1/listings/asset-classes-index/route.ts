import {
  EtfGroupingPreview,
  EtfUncategorizedPreview,
  fetchEtfsForGroupings,
  fetchEtfsWithoutAssetClass,
} from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
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

  const valueToKey = new Map<string, string>();
  for (const opt of ETF_ASSET_CLASS_OPTIONS) {
    if (opt.value !== '') valueToKey.set(opt.value, opt.value);
  }

  const [grouped, others] = await Promise.all([
    fetchEtfsForGroupings(spaceId, 'assetClass', valueToKey, country, includeUnpopulated),
    fetchEtfsWithoutAssetClass(spaceId, country, includeUnpopulated),
  ]);

  return { values: grouped.values, counts: grouped.counts, others };
}

export const GET = withErrorHandlingV2<EtfAssetClassesIndexResponse>(getHandler);

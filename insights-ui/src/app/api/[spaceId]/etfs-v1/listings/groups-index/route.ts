import {
  EtfGroupingPreview,
  EtfUncategorizedPreview,
  fetchEtfsForGroupings,
  fetchUncategorizedEtfPreview,
} from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { getCategoriesForGroupKey, getAllEtfGroups } from '@/utils/etf-categorization-utils';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfGroupsIndexResponse {
  categoryValues: EtfGroupingPreview['values'];
  categoryCounts: EtfGroupingPreview['counts'];
  groupCounts: EtfGroupingPreview['counts'];
  others: EtfUncategorizedPreview;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfGroupsIndexResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country')?.trim();
  const country = countryParam && isEtfSupportedCountry(countryParam) ? countryParam : undefined;

  const groups = getAllEtfGroups();

  const categoryValueToKey = new Map<string, string>();
  const groupValueToKey = new Map<string, string>();
  for (const group of groups) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      categoryValueToKey.set(cat.name, cat.name);
      groupValueToKey.set(cat.name, group.key);
    }
  }

  const [byCategory, byGroup, others] = await Promise.all([
    fetchEtfsForGroupings(spaceId, 'category', categoryValueToKey, country),
    fetchEtfsForGroupings(spaceId, 'category', groupValueToKey, country),
    fetchUncategorizedEtfPreview(spaceId, country),
  ]);

  return {
    categoryValues: byCategory.values,
    categoryCounts: byCategory.counts,
    groupCounts: byGroup.counts,
    others,
  };
}

export const GET = withErrorHandlingV2<EtfGroupsIndexResponse>(getHandler);

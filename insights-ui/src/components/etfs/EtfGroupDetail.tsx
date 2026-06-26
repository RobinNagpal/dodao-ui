import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import EtfCategoriesGrid, { EtfCategoryCardSpec } from '@/components/etfs/EtfCategoriesGrid';
import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import { getEtfGroupByKey, getCategoriesForGroupKey, ETF_OTHERS_GROUP_KEY } from '@/utils/etf-categorization-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfCountryDisplayName, etfGroupCategoryPath } from '@/utils/etf-country-route-utils';
import { notFound } from 'next/navigation';

interface EtfGroupDetailProps {
  country: EtfSupportedCountry;
  groupKey: string;
  data: EtfGroupDetailResponse;
}

export default function EtfGroupDetail({ country, groupKey, data }: EtfGroupDetailProps) {
  if (!data.found) notFound();

  const groupObj = getEtfGroupByKey(groupKey);
  if (!groupObj) notFound();

  const displayCountry = etfCountryDisplayName(country);

  let cardSpecs: EtfCategoryCardSpec[] = [];

  if (groupObj.key === ETF_OTHERS_GROUP_KEY) {
    if (data.others && data.others.count > 0) {
      cardSpecs = [
        {
          key: ETF_OTHERS_GROUP_KEY,
          categoryName: 'Uncategorized',
          href: etfBrowseDetailPath(country, 'groups', ETF_OTHERS_GROUP_KEY),
          etfs: data.others.items,
          total: data.others.count,
        },
      ];
    }
  } else {
    const categories = getCategoriesForGroupKey(groupObj.key);
    cardSpecs = categories
      .map((cat) => ({
        key: cat.name,
        categoryName: cat.name,
        href: etfGroupCategoryPath(country, groupObj.key, cat.name),
        etfs: data.values[cat.name] ?? [],
        total: data.counts[cat.name] ?? 0,
      }))
      .filter((spec) => spec.etfs.length > 0);
  }

  return (
    <EtfPageLayout
      title={`${groupObj.name} ${displayCountry} ETFs`}
      description={groupObj.description}
      currentCountry={country}
      switcherSection="groups"
      switcherHref={(c) => etfBrowseDetailPath(c, 'groups', groupObj.key)}
      extraBreadcrumbs={[{ name: groupObj.name, href: etfBrowseDetailPath(country, 'groups', groupObj.key), current: true }]}
      revalidateTag={{ kind: 'group-detail', country, groupKey }}
    >
      <EtfCategoriesGrid categories={cardSpecs} emptyMessage={`No ${displayCountry} ETFs found in the ${groupObj.name} group.`} />
    </EtfPageLayout>
  );
}

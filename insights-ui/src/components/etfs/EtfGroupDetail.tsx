import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import EtfCategoriesGrid, { EtfCategoryCardSpec } from '@/components/etfs/EtfCategoriesGrid';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfGroupByKey, getCategoriesForGroupKey, ETF_OTHERS_GROUP_KEY } from '@/utils/etf-categorization-utils';
import { fetchAllEtfsByCategory, fetchUncategorizedEtfPreview } from '@/utils/etf-grouping-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfCountryDisplayName, etfGroupCategoryPath } from '@/utils/etf-country-route-utils';
import { notFound } from 'next/navigation';

interface EtfGroupDetailProps {
  country: EtfSupportedCountry;
  groupKey: string;
}

export default async function EtfGroupDetail({ country, groupKey }: EtfGroupDetailProps) {
  const groupObj = getEtfGroupByKey(groupKey);
  if (!groupObj) notFound();

  const displayCountry = etfCountryDisplayName(country);

  const categories = getCategoriesForGroupKey(groupObj.key);
  const categoryNames = categories.map((c) => c.name);

  let cardSpecs: EtfCategoryCardSpec[] = [];

  if (groupObj.key === ETF_OTHERS_GROUP_KEY) {
    // "Others" has no analysis categories — render uncategorized ETFs as a single card.
    const others = await fetchUncategorizedEtfPreview(KoalaGainsSpaceId, country);
    if (others.count > 0) {
      cardSpecs = [
        {
          key: ETF_OTHERS_GROUP_KEY,
          categoryName: 'Uncategorized',
          href: etfBrowseDetailPath(country, 'groups', ETF_OTHERS_GROUP_KEY),
          etfs: others.items,
          total: others.count,
        },
      ];
    }
  } else {
    const { values, counts } = await fetchAllEtfsByCategory(KoalaGainsSpaceId, categoryNames, country);
    cardSpecs = categories
      .map((cat) => ({
        key: cat.name,
        categoryName: cat.name,
        href: etfGroupCategoryPath(country, groupObj.key, cat.name),
        etfs: values.get(cat.name) ?? [],
        total: counts.get(cat.name) ?? 0,
      }))
      .filter((spec) => spec.etfs.length > 0);
  }

  return (
    <EtfPageLayout
      title={`${groupObj.name} ${displayCountry} ETFs`}
      description={groupObj.description}
      currentCountry={country}
      switcherSection="groups"
      extraBreadcrumbs={[{ name: groupObj.name, href: etfBrowseDetailPath(country, 'groups', groupObj.key), current: true }]}
    >
      <EtfCategoriesGrid categories={cardSpecs} emptyMessage={`No ${displayCountry} ETFs found in the ${groupObj.name} group.`} />
    </EtfPageLayout>
  );
}

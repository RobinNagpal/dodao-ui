import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfCategoryByName, getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfCountryDisplayName, etfGroupCategoryPath } from '@/utils/etf-country-route-utils';
import { notFound, permanentRedirect } from 'next/navigation';

interface EtfGroupCategoryDetailProps {
  country: EtfSupportedCountry;
  groupKey: string;
  category: string;
  searchParams: EtfSearchParams;
}

export default async function EtfGroupCategoryDetail({ country, groupKey, category, searchParams }: EtfGroupCategoryDetailProps) {
  const groupObj = getEtfGroupByKey(groupKey);
  if (!groupObj) notFound();

  const knownCategory = getEtfCategoryByName(category);
  if (!knownCategory) notFound();

  // The category must actually belong to this group; otherwise redirect to the
  // canonical group-category combination so we never serve mismatched URLs.
  if (knownCategory.group !== groupObj.key) {
    permanentRedirect(etfGroupCategoryPath(country, knownCategory.group, knownCategory.name));
  }

  const displayCountry = etfCountryDisplayName(country);

  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.CATEGORY]: knownCategory.name,
    },
    country
  );

  return (
    <EtfPageLayout
      title={`${knownCategory.name} ${displayCountry} ETFs`}
      description={`Explore ${displayCountry} ETFs in the ${knownCategory.name} category (part of ${groupObj.name}) with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`}
      currentCountry={country}
      switcherSection="groups"
      extraBreadcrumbs={[
        { name: groupObj.name, href: etfBrowseDetailPath(country, 'groups', groupObj.key), current: false },
        { name: knownCategory.name, href: etfGroupCategoryPath(country, groupObj.key, knownCategory.name), current: true },
      ]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}

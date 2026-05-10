import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfGroupName, getEtfCategoryByName } from '@/utils/etf-categorization-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';

interface EtfCategoryDetailProps {
  country: EtfSupportedCountry;
  category: string;
  searchParams: EtfSearchParams;
}

export default async function EtfCategoryDetail({ country, category, searchParams }: EtfCategoryDetailProps) {
  const knownCategory = getEtfCategoryByName(category);
  const groupName = getEtfGroupName(category);
  const displayCountry = etfCountryDisplayName(country);

  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.CATEGORY]: category,
    },
    country
  );

  const description = groupName
    ? `Explore ${displayCountry} ETFs in the ${category} category (${groupName}) with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`
    : `Explore ${displayCountry} ETFs in the ${category} category with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`;

  return (
    <EtfPageLayout
      title={`${category} ${displayCountry} ETFs`}
      description={description}
      currentCountry={country}
      switcherSection="categories"
      extraBreadcrumbs={[
        { name: 'All Categories', href: etfBrowsePath(country, 'categories'), current: false },
        { name: category, href: etfBrowseDetailPath(country, 'categories', category), current: true },
      ]}
    >
      {knownCategory && groupName && (
        <p className="text-sm text-gray-400 -mt-4 mb-4">
          Part of <span className="text-white">{groupName}</span>
        </p>
      )}
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}

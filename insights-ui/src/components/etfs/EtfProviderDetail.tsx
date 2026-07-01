import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { ETF_OTHERS_GROUP_KEY } from '@/utils/etf-categorization-utils';
import { EtfFilterParamKey, EtfSearchParams } from '@/utils/etf-filter-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';

interface EtfProviderDetailProps {
  country: EtfSupportedCountry;
  provider: string;
  searchParams: EtfSearchParams;
}

export default async function EtfProviderDetail({ country, provider, searchParams }: EtfProviderDetailProps) {
  const displayCountry = etfCountryDisplayName(country);

  // "Others" = ETFs with no issuer. Pass the sentinel through to the listing
  // API, which interprets issuer=others as "issuer is null / no row".
  const isOthers = slugifyEtfTag(provider) === ETF_OTHERS_GROUP_KEY;
  const issuerFilter = isOthers ? ETF_OTHERS_GROUP_KEY : provider;

  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.ISSUER]: issuerFilter,
    },
    country
  );

  return (
    <EtfPageLayout
      title={`${provider} ${displayCountry} ETFs`}
      description={`Explore ${displayCountry} ETFs issued by ${provider} with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`}
      currentCountry={country}
      switcherSection="providers"
      switcherHref={(c) => etfBrowseDetailPath(c, 'providers', slugifyEtfTag(provider))}
      extraBreadcrumbs={[
        { name: 'All Providers', href: etfBrowsePath(country, 'providers'), current: false },
        { name: provider, href: etfBrowseDetailPath(country, 'providers', slugifyEtfTag(provider)), current: true },
      ]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}

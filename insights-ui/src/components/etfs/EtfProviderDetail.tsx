import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
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

  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.ISSUER]: provider,
    },
    country
  );

  return (
    <EtfPageLayout
      title={`${provider} ${displayCountry} ETFs`}
      description={`Explore ${displayCountry} ETFs issued by ${provider} with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`}
      currentCountry={country}
      switcherSection="providers"
      extraBreadcrumbs={[
        { name: 'All Providers', href: etfBrowsePath(country, 'providers'), current: false },
        { name: provider, href: etfBrowseDetailPath(country, 'providers', slugifyEtfTag(provider)), current: true },
      ]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}

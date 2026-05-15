import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { fetchEtfProvidersForCountry } from '@/utils/etf-grouping-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';

interface EtfProvidersIndexProps {
  country: EtfSupportedCountry;
}

export default async function EtfProvidersIndex({ country }: EtfProvidersIndexProps) {
  const { providers, values, counts } = await fetchEtfProvidersForCountry(KoalaGainsSpaceId, country);

  const displayName = etfCountryDisplayName(country);
  const providersPath = etfBrowsePath(country, 'providers');

  return (
    <EtfPageLayout
      title={`${displayName} ETFs by Provider`}
      description={`Browse ${displayName} ETFs grouped by issuer. Each card shows the top-rated ETFs from that provider.`}
      currentCountry={country}
      switcherSection="providers"
      extraBreadcrumbs={[{ name: 'Providers', href: providersPath, current: true }]}
    >
      {providers.length === 0 ? (
        <p className="text-[#E5E7EB] text-md">No providers available for {displayName} ETFs.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {providers.map((provider) => (
            <CompactEtfGroupingCard
              key={provider}
              title={provider}
              href={etfBrowseDetailPath(country, 'providers', slugifyEtfTag(provider))}
              totalCount={counts.get(provider) ?? 0}
              etfs={values.get(provider) ?? []}
            />
          ))}
        </div>
      )}
    </EtfPageLayout>
  );
}

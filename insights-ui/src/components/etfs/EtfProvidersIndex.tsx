import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import EtfGroupingCardGrid from '@/components/etfs/EtfGroupingCardGrid';
import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';

interface EtfProvidersIndexProps {
  country: EtfSupportedCountry;
  data: EtfProvidersIndexResponse;
}

export default function EtfProvidersIndex({ country, data }: EtfProvidersIndexProps) {
  const { providers, values, counts } = data;
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
        <EtfGroupingCardGrid
          columns={3}
          items={providers.map((provider) => ({
            key: provider,
            title: provider,
            href: etfBrowseDetailPath(country, 'providers', slugifyEtfTag(provider)),
            totalCount: counts[provider] ?? 0,
            etfs: values[provider] ?? [],
          }))}
        />
      )}
    </EtfPageLayout>
  );
}

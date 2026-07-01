import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import EtfGroupingCardGrid, { EtfGroupingCardSpec } from '@/components/etfs/EtfGroupingCardGrid';
import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import { ETF_OTHERS_GROUP } from '@/utils/etf-categorization-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';

interface EtfProvidersIndexProps {
  country: EtfSupportedCountry;
  data: EtfProvidersIndexResponse;
}

export default function EtfProvidersIndex({ country, data }: EtfProvidersIndexProps) {
  const { providers, values, counts, others } = data;
  const displayName = etfCountryDisplayName(country);
  const providersPath = etfBrowsePath(country, 'providers');

  const items: EtfGroupingCardSpec[] = providers.map((provider) => ({
    key: provider,
    title: provider,
    href: etfBrowseDetailPath(country, 'providers', slugifyEtfTag(provider)),
    totalCount: counts[provider] ?? 0,
    etfs: values[provider] ?? [],
  }));

  // Append an "Others" bucket for ETFs with no issuer — only when some exist.
  if (others.count > 0) {
    items.push({
      key: ETF_OTHERS_GROUP.key,
      title: ETF_OTHERS_GROUP.name,
      href: etfBrowseDetailPath(country, 'providers', ETF_OTHERS_GROUP.key),
      totalCount: others.count,
      etfs: others.items,
    });
  }

  return (
    <EtfPageLayout
      title={`${displayName} ETFs by Provider`}
      description={`Browse ${displayName} ETFs grouped by issuer. Each card shows the top-rated ETFs from that provider.`}
      currentCountry={country}
      switcherSection="providers"
      extraBreadcrumbs={[{ name: 'Providers', href: providersPath, current: true }]}
      revalidateTag={{ kind: 'providers-index', country }}
    >
      {items.length === 0 ? (
        <p className="text-[#E5E7EB] text-md">No providers available for {displayName} ETFs.</p>
      ) : (
        <EtfGroupingCardGrid columns={3} items={items} />
      )}
    </EtfPageLayout>
  );
}

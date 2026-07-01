import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import EtfCountryAlternatives from '@/components/etfs/EtfCountryAlternatives';
import EtfGroupingCardGrid, { EtfGroupingCardSpec } from '@/components/etfs/EtfGroupingCardGrid';
import { ETF_OTHERS_GROUP } from '@/utils/etf-categorization-utils';
import { etfBrowseDetailPath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import React from 'react';

export interface TopEtfAssetClassesShowcaseProps {
  country: EtfSupportedCountry;
  data: EtfAssetClassesIndexResponse;
}

/**
 * Home-page showcase of top-rated ETFs grouped by asset class — the ETF twin of the stocks
 * `TopIndustriesShowcase`. Reuses the `/etfs/asset-classes` cards so the home page and listing
 * pages stay visually consistent. Empty asset classes (e.g. US Multi-Asset) are hidden and the
 * "Others" bucket is appended so the grid stays full. Renders nothing when no populated ETFs exist.
 */
export default function TopEtfAssetClassesShowcase({ country, data }: TopEtfAssetClassesShowcaseProps): React.JSX.Element | null {
  const assetClasses = ETF_ASSET_CLASS_OPTIONS.filter((opt) => opt.value !== '');

  // Only surface asset classes that actually have ETFs — keeps empty buckets (e.g. US Multi-Asset)
  // off the home page so the grid never shows a blank card.
  const items: EtfGroupingCardSpec[] = assetClasses
    .filter((opt) => (data.values[opt.value]?.length ?? 0) > 0)
    .map((opt) => ({
      key: opt.value,
      title: opt.label,
      href: etfBrowseDetailPath(country, 'asset-classes', slugifyEtfTag(opt.value)),
      totalCount: data.counts[opt.value] ?? 0,
      etfs: data.values[opt.value] ?? [],
    }));

  // Append the "Others" bucket (ETFs with no asset class) so the grid rounds out — this fills the
  // slot the empty Multi-Asset card would otherwise leave.
  if (data.others.count > 0) {
    items.push({
      key: ETF_OTHERS_GROUP.key,
      title: ETF_OTHERS_GROUP.name,
      href: etfBrowseDetailPath(country, 'asset-classes', ETF_OTHERS_GROUP.key),
      totalCount: data.others.count,
      etfs: data.others.items,
    });
  }

  if (items.length === 0) {
    return null;
  }

  const displayName = etfCountryDisplayName(country);

  return (
    <section className="bg-gray-800">
      <div className="w-full mx-auto max-w-7xl sm:px-2 lg:px-8 px-6 py-12 sm:py-16">
        <div className="mb-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Explore <span className="text-indigo-400">{displayName} ETFs</span> by Asset Class
          </h2>
          <p className="mt-3 text-base sm:text-lg leading-7 text-gray-300 max-w-2xl mx-auto">
            AI-generated investment analysis and scoring across {displayName} ETFs.
          </p>
        </div>

        {/* "Also view" country links — includes the US so it doubles as the entry point to all US ETFs */}
        <div className="flex justify-center mb-8">
          <EtfCountryAlternatives currentCountry={country} includeCurrent />
        </div>

        <EtfGroupingCardGrid columns={3} items={items} />
      </div>

      {/* Separator between the ETF section and "Explore Our Insights" */}
      <div className="border-b border-gray-600"></div>
    </section>
  );
}

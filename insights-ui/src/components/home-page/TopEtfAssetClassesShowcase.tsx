import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import SearchBar from '@/components/core/SearchBar';
import EtfCountryAlternatives from '@/components/etfs/EtfCountryAlternatives';
import EtfGroupingCardGrid, { EtfGroupingCardSpec } from '@/components/etfs/EtfGroupingCardGrid';
import { ETF_OTHERS_GROUP } from '@/utils/etf-categorization-utils';
import { etfBasePath, etfBrowseDetailPath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import Link from 'next/link';
import React from 'react';

/** Home-page anchor id — the "New: ETF Reports" hero pill links here. */
export const ETF_SHOWCASE_ANCHOR_ID = 'etf-analysis';

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
    <section id={ETF_SHOWCASE_ANCHOR_ID} className="scroll-mt-24 bg-gray-800">
      <div className="w-full mx-auto max-w-7xl sm:px-2 lg:px-8 px-6 py-12 sm:py-16">
        <div className="mb-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Explore <span className="text-indigo-400">{displayName} ETFs</span> by Asset Class
          </h2>
          <p className="mt-3 text-base sm:text-lg leading-7 text-gray-300 max-w-2xl mx-auto">
            AI-generated investment analysis and scoring across {displayName} ETFs — browse by asset class.
          </p>
        </div>

        {/* Dedicated ETF search — reuses the dual-mode SearchBar (kind="etfs"). autoFocus is off so
            this below-the-fold bar can't steal focus/scroll from the hero search on load. */}
        <SearchBar kind="etfs" variant="hero" autoFocus={false} placeholder="Search ETFs by name or ticker symbol" />

        <div className="flex justify-center mb-8">
          <EtfCountryAlternatives currentCountry={country} />
        </div>

        <EtfGroupingCardGrid columns={3} items={items} />

        <div className="flex justify-center">
          <Link
            href={etfBasePath(country)}
            aria-label={`Browse all ${displayName} ETFs`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3
                       text-sm sm:text-base font-semibold text-gray-900
                       bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]
                       hover:from-[#FBBF24] hover:to-[#F59E0B]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                       focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800
                       shadow-md hover:shadow-lg transition-all"
          >
            Browse all {displayName} ETFs <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

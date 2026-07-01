import EtfGroupingCardGrid, { EtfGroupingCardSpec } from '@/components/etfs/EtfGroupingCardGrid';
import type { EtfGroupingPreview } from '@/types/etf/etf-listings-types';
import { getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
import { etfBasePath, etfCountryDisplayName, etfGroupCategoryPath } from '@/utils/etf-country-route-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import Link from 'next/link';
import React from 'react';

export interface TopEtfsShowcaseProps {
  country: EtfSupportedCountry;
  /** Top ETFs per category (keyed by canonical category name) from {@link getTopEtfCategories}. */
  categories: EtfGroupingPreview;
}

/** Max number of category cards to surface on the home page. */
const MAX_CARDS = 8;

/**
 * Home-page showcase of the top-rated ETFs, grouped into a compact set of category cards.
 * Mirrors the stocks-side {@link TopIndustriesShowcase} and reuses the ETF listing cards so the
 * home page and `/etfs` stay visually consistent. Renders nothing when no populated ETFs exist.
 */
export default function TopEtfsShowcase({ country, categories }: TopEtfsShowcaseProps): React.JSX.Element | null {
  const { values, counts } = categories;

  const cards: EtfGroupingCardSpec[] = [];
  for (const group of getAllEtfGroups()) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      const etfs = values[cat.name] ?? [];
      if (etfs.length === 0) continue;
      cards.push({
        key: `${group.key}-${cat.name}`,
        title: cat.name,
        href: etfGroupCategoryPath(country, group.key, cat.name),
        totalCount: counts[cat.name] ?? 0,
        etfs,
      });
      if (cards.length >= MAX_CARDS) break;
    }
    if (cards.length >= MAX_CARDS) break;
  }

  if (cards.length === 0) {
    return null;
  }

  const displayName = etfCountryDisplayName(country);

  return (
    <section className="bg-gray-800">
      <div className="w-full mx-auto max-w-7xl sm:px-2 lg:px-8 px-6 py-10 sm:py-12">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-white">Explore Top {displayName} ETFs by Category</h2>
          <p className="text-gray-300 text-sm sm:text-base mt-1 max-w-2xl mx-auto">
            Diversified, sector, fixed income, and alternative-strategy funds — each card lists the top-rated ETFs in that category.
          </p>
        </div>

        <EtfGroupingCardGrid columns={4} items={cards} />

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

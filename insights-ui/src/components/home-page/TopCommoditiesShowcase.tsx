import CommodityGroupCard from '@/components/commodity-reports/CommodityGroupCard';
import type { CommodityListItem } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import React from 'react';

export interface TopCommoditiesShowcaseProps {
  commodities: CommodityListItem[];
}

/**
 * Home-page showcase of commodities grouped by `commodityGroup` — the commodity
 * twin of the ETF `TopEtfAssetClassesShowcase` and stock `TopIndustriesShowcase`.
 * Reuses the `/commodities` listing `CommodityGroupCard` so the home page and
 * listing page stay visually consistent. There are four groups (Energy, Metals,
 * Agriculture, Livestock), so the grid rounds out to one row of four cards.
 * Renders nothing when no commodities exist.
 */
export default function TopCommoditiesShowcase({ commodities }: TopCommoditiesShowcaseProps): React.JSX.Element | null {
  if (commodities.length === 0) {
    return null;
  }

  const groups = Array.from(new Set(commodities.map((c) => c.commodityGroup)));

  return (
    <section className="bg-gray-800">
      <div className="w-full mx-auto max-w-7xl sm:px-2 lg:px-8 px-6 py-8 sm:py-12">
        <div className="mb-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Explore <span className="text-indigo-400">Commodities</span> by Group
          </h2>
          <p className="mt-3 text-base sm:text-lg leading-7 text-gray-300 max-w-2xl mx-auto">
            AI-generated analysis and scoring across Energy, Metals, Agriculture &amp; Livestock.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {groups.map((group) => (
            <CommodityGroupCard key={group} group={group} commodities={commodities.filter((c) => c.commodityGroup === group)} />
          ))}
        </div>
      </div>

      {/* Separator matching the ETF section above so the home-page rhythm stays consistent */}
      <div className="border-b border-gray-600"></div>
    </section>
  );
}

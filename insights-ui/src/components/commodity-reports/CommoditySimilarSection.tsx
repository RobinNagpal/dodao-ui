import CommoditySimilar from '@/components/commodity-reports/CommoditySimilar';
import { fetchSimilarCommodities } from '@/utils/commodity-analysis-reports/get-similar-commodities-utils';
import { Suspense } from 'react';

export interface CommoditySimilarSectionProps {
  /** Commodity url slug (e.g. `gold`). */
  slug: string;
  /**
   * Sub-report slug of the page hosting this section (e.g. `price-and-value`).
   * Each peer then links to the *same* sub-report for that peer, keeping the
   * reader on the section they were viewing. Omit on the main report page.
   */
  subPageSlug?: string;
}

/**
 * Self-contained "Similar Commodities" section: fetches from the shared
 * `similar-commodities` API and streams <CommoditySimilar> behind its own
 * Suspense boundary. Drop-in for the commodity main report and sub-reports so
 * neither has to query prisma directly. Mirrors the stock `SimilarTickersSection`.
 */
export default function CommoditySimilarSection({ slug, subPageSlug }: CommoditySimilarSectionProps): JSX.Element {
  const similarPromise = fetchSimilarCommodities(slug);

  return (
    <div className="[content-visibility:auto] [contain-intrinsic-size:auto_800px]">
      <Suspense fallback={null}>
        <CommoditySimilar dataPromise={similarPromise} subPageSlug={subPageSlug} />
      </Suspense>
    </div>
  );
}

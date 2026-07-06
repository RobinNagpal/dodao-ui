import { SimilarCommodity } from '@/utils/commodity-analysis-reports/get-similar-commodities-utils';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export interface CommoditySimilarProps {
  similar: ReadonlyArray<SimilarCommodity>;
  /**
   * Sub-report slug (e.g. "price-and-value"). When set, each peer links to the
   * *same* sub-report of that commodity instead of its main report — so a reader
   * on the price-and-value page lands on the peer's price-and-value page. Omit on
   * the main report to link to the peer's main report.
   */
  subPageSlug?: string;
}

/**
 * "Similar Commodities" section — the commodity parallel of the stock "Top
 * Similar Companies" / ETF "Similar ETFs" sections. Shows other commodities in
 * the same group as a card grid, reusing the same visual design (semantic color
 * tokens, hover states). Rendered on both the main report and the sub-reports.
 */
export default function CommoditySimilar({ similar, subPageSlug }: CommoditySimilarProps): JSX.Element | null {
  if (similar.length === 0) return null;

  return (
    <section id="similar-commodities" className="bg-surface rounded-lg shadow-sm p-3 sm:p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">Similar Commodities</h2>
      <p className="text-body mb-4">Other commodities in the same group:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similar.map((commodity) => {
          const basePath = `/commodities/${commodity.slug}`;
          const href = subPageSlug ? `${basePath}/${subPageSlug}` : basePath;
          return (
            <Link
              key={commodity.id}
              href={href}
              prefetch={false}
              className="block bg-surface-2 p-3 sm:p-4 rounded-md border border-border hover:border-primary transition-colors group"
            >
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-2">
                  <h3 className="font-semibold text-lg text-link group-hover:text-heading transition-colors">{commodity.name}</h3>
                  <ArrowTopRightOnSquareIcon className="size-4 text-muted group-hover:text-link transition-colors" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{commodity.commodityGroup}</span>
                  {commodity.finalScore !== null && <span className="text-sm font-medium text-heading">Score {commodity.finalScore}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

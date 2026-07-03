import { CommodityAnalysisCategory, COMMODITY_CATEGORY_NAMES, COMMODITY_CATEGORY_TO_PATH } from '@/types/commodity/commodity-analysis-types';
import { CommodityCategoryResultWithFactors } from '@/utils/commodity-analysis-reports/commodity-spider-graph';
import { parseMarkdown } from '@/util/parse-markdown';
import Link from 'next/link';

const CATEGORY_ORDER: CommodityAnalysisCategory[] = [
  CommodityAnalysisCategory.SupplyAndDemand,
  CommodityAnalysisCategory.PriceAndValue,
  CommodityAnalysisCategory.VolatilityAndRisk,
  CommodityAnalysisCategory.FutureOutlook,
];

interface CommoditySummaryAnalysisProps {
  slug: string;
  categoryResults: CommodityCategoryResultWithFactors[];
}

/**
 * "Summary Analysis" block for a commodity — the parallel of the ETF/stock
 * `EtfAnalysisSections`. Each scored category is a `bg-surface` card showing the
 * pass/total chip, a "View Detailed Analysis →" link to the category sub-page,
 * and the category's overall-analysis markdown. Categories not yet generated
 * render as a muted placeholder so the four-section shape stays stable.
 */
export default function CommoditySummaryAnalysis({ slug, categoryResults }: CommoditySummaryAnalysisProps): JSX.Element {
  return (
    <section id="summary-analysis" className="mb-4 sm:py-6" itemProp="abstract">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">Summary Analysis</h2>
      <div className="space-y-4">
        {CATEGORY_ORDER.map((categoryKey) => {
          const categoryResult = categoryResults.find((r) => r.categoryKey === categoryKey);
          const passCount = categoryResult?.factorResults.filter((fr) => fr.result === 'Pass').length ?? 0;
          const totalCount = categoryResult?.factorResults.length ?? 0;
          return (
            <div key={categoryKey} className="bg-surface p-3 sm:p-4 rounded-md shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{COMMODITY_CATEGORY_NAMES[categoryKey]}</h3>
                  {categoryResult && (
                    <div
                      className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
                    >
                      {passCount}/{totalCount}
                    </div>
                  )}
                </div>
                {categoryResult && (
                  <Link
                    href={`/commodities/${slug}/${COMMODITY_CATEGORY_TO_PATH[categoryKey]}`}
                    prefetch={false}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-heading shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                    style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
                  >
                    View Detailed Analysis →
                  </Link>
                )}
              </div>
              {categoryResult ? (
                <div
                  className="text-body markdown markdown-body"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult.overallAnalysisDetails || 'No summary available.') }}
                />
              ) : (
                <p className="text-sm text-muted">Not generated yet.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

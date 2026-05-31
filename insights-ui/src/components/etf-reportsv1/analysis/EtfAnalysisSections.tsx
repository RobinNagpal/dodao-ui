import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import AdminTimestamp from '@/components/auth/AdminTimestamp';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { parseMarkdown } from '@/util/parse-markdown';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

const CATEGORY_DISPLAY: Record<string, { name: string; order: number; slug: string }> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: { name: 'Performance & Returns', order: 1, slug: 'performance-returns' },
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: { name: 'Cost, Efficiency & Team', order: 2, slug: 'cost-efficiency-team' },
  [EtfAnalysisCategory.RiskAnalysis]: { name: 'Risk Analysis', order: 3, slug: 'risk-analysis' },
  [EtfAnalysisCategory.FuturePerformanceOutlook]: { name: 'Future Performance Outlook', order: 4, slug: 'future-performance-outlook' },
};

// Future Performance Outlook leads the Summary Analysis (it carries the
// forward-return figures), followed by the backward-looking reports.
const CATEGORY_ORDER = [
  EtfAnalysisCategory.FuturePerformanceOutlook,
  EtfAnalysisCategory.PerformanceAndReturns,
  EtfAnalysisCategory.CostEfficiencyAndTeam,
  EtfAnalysisCategory.RiskAnalysis,
];

interface EtfAnalysisSectionsProps {
  data: EtfAnalysisResponse;
  exchange: string;
  symbol: string;
  /** Optional content rendered inside the Summary Analysis flow, immediately after the Performance & Returns card. */
  afterPerformanceReturns?: ReactNode;
  /** Optional content rendered at the top of the Future Performance Outlook card (e.g. expected-return figures). */
  futureOutlookTop?: ReactNode;
}

export default function EtfAnalysisSections({
  data,
  exchange,
  symbol,
  afterPerformanceReturns,
  futureOutlookTop,
}: EtfAnalysisSectionsProps): JSX.Element | null {
  if (!data.categories || data.categories.length === 0) {
    return null;
  }

  return (
    <section id="summary-analysis" className="bg-surface-2 rounded-lg shadow-sm mb-4 sm:py-6" itemProp="abstract">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">Summary Analysis</h2>
      <div className="space-y-4">
        {CATEGORY_ORDER.map((categoryKey) => {
          const categoryResult = data.categories.find((r) => r.categoryKey === categoryKey);
          const display = CATEGORY_DISPLAY[categoryKey] || { name: categoryKey, order: 99, slug: '' };
          return (
            <Fragment key={categoryKey}>
              <div className="bg-surface p-3 sm:p-4 rounded-md shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{display.name}</h3>
                    {categoryResult && (
                      <div
                        className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
                      >
                        {categoryResult.factorResults?.filter((fr) => fr.result === 'Pass').length || 0}/{categoryResult.factorResults?.length || 0}
                      </div>
                    )}
                    {categoryResult?.updatedAt && <AdminTimestamp date={categoryResult.updatedAt} />}
                  </div>
                  {categoryResult && display.slug && (
                    <Link
                      href={`/etfs/${exchange}/${symbol}/${display.slug}`}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-heading shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                      style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
                    >
                      View Detailed Analysis →
                    </Link>
                  )}
                </div>
                {categoryKey === EtfAnalysisCategory.FuturePerformanceOutlook && futureOutlookTop}
                <div
                  className="text-body markdown markdown-body"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult?.overallAnalysisDetails || 'No summary available.') }}
                />
              </div>
              {categoryKey === EtfAnalysisCategory.PerformanceAndReturns && afterPerformanceReturns}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

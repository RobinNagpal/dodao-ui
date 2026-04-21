'use client';

import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { parseMarkdown } from '@/util/parse-markdown';
import Link from 'next/link';

const CATEGORY_DISPLAY: Record<string, { name: string; order: number; slug: string }> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: { name: 'Performance & Returns', order: 1, slug: 'performance-returns' },
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: { name: 'Cost, Efficiency & Team', order: 2, slug: 'cost-efficiency-team' },
  [EtfAnalysisCategory.RiskAnalysis]: { name: 'Risk Analysis', order: 3, slug: 'risk-analysis' },
  [EtfAnalysisCategory.FuturePerformanceOutlook]: { name: 'Future Performance Outlook', order: 4, slug: 'future-performance-outlook' },
};

const CATEGORY_ORDER = [
  EtfAnalysisCategory.PerformanceAndReturns,
  EtfAnalysisCategory.CostEfficiencyAndTeam,
  EtfAnalysisCategory.RiskAnalysis,
  EtfAnalysisCategory.FuturePerformanceOutlook,
];

interface EtfAnalysisSectionsProps {
  data: EtfAnalysisResponse;
  exchange: string;
  symbol: string;
}

export default function EtfAnalysisSections({ data, exchange, symbol }: EtfAnalysisSectionsProps): JSX.Element | null {
  if (!data.categories || data.categories.length === 0) {
    return null;
  }

  return (
    <section id="summary-analysis" className="bg-gray-800 rounded-lg shadow-sm mb-8" itemProp="abstract">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700 px-4">Summary Analysis</h2>
      <div className="space-y-4 px-4">
        {CATEGORY_ORDER.map((categoryKey) => {
          const categoryResult = data.categories.find((r) => r.categoryKey === categoryKey);
          const display = CATEGORY_DISPLAY[categoryKey] || { name: categoryKey, order: 99, slug: '' };
          return (
            <div key={categoryKey} className="bg-gray-900 p-4 rounded-md shadow-sm">
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
                </div>
                {categoryResult && display.slug && (
                  <Link
                    href={`/etfs/${exchange}/${symbol}/${display.slug}`}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                    style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
                  >
                    View Detailed Analysis →
                  </Link>
                )}
              </div>
              <div
                className="text-gray-300 markdown markdown-body"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult?.overallAnalysisDetails || 'No summary available.') }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

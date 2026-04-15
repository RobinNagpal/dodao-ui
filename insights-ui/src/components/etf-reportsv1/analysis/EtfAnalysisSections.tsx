'use client';

import { EtfAnalysisResponse, EtfCategoryAnalysisResultResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import etfAnalysisFactorsConfig from '@/etf-analysis-data/etf-analysis-factors.json';
import { parseMarkdown } from '@/util/parse-markdown';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const CATEGORY_NAMES: Record<string, string> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: 'Performance & Returns',
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: 'Cost, Efficiency & Team',
  [EtfAnalysisCategory.RiskAnalysis]: 'Risk Analysis',
};

const CATEGORY_ORDER = [EtfAnalysisCategory.PerformanceAndReturns, EtfAnalysisCategory.CostEfficiencyAndTeam, EtfAnalysisCategory.RiskAnalysis];

function getFactorTitle(categoryKey: string, factorKey: string): string {
  const cat = etfAnalysisFactorsConfig.categories.find((c) => c.categoryKey === categoryKey);
  const factor = cat?.factors.find((f) => f.factorAnalysisKey === factorKey);
  return factor?.factorAnalysisTitle || factorKey;
}

function EtfSummaryAnalysis({ data }: { data: EtfAnalysisResponse }): JSX.Element {
  return (
    <section id="summary-analysis" className="bg-gray-800 rounded-lg shadow-sm mb-8 sm:py-6" itemProp="abstract">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700 px-4">Summary Analysis</h2>
      <div className="space-y-4 px-4">
        {CATEGORY_ORDER.map((categoryKey) => {
          const categoryResult = data.categories.find((r) => r.categoryKey === categoryKey);
          return (
            <div key={categoryKey} className="bg-gray-900 p-4 rounded-md shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{CATEGORY_NAMES[categoryKey] || categoryKey}</h3>
                {categoryResult && (
                  <div
                    className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
                  >
                    {categoryResult.factorResults?.filter((fr) => fr.result === 'Pass').length || 0}/{categoryResult.factorResults?.length || 0}
                  </div>
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

function EtfDetailedAnalysis({ data }: { data: EtfAnalysisResponse }): JSX.Element {
  return (
    <section id="detailed-analysis" className="mb-8" itemProp="articleBody">
      <h2 className="text-2xl font-bold mb-6">Detailed Analysis</h2>

      {CATEGORY_ORDER.map((categoryKey) => {
        const categoryResult = data.categories.find((r) => r.categoryKey === categoryKey);
        if (!categoryResult) return null;

        return (
          <div key={`detail-${categoryKey}`} id={`detailed-${categoryKey}`} className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700">
              <h3 className="text-xl font-bold">{CATEGORY_NAMES[categoryKey] || categoryKey}</h3>
              <div
                className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
              >
                {categoryResult.factorResults?.filter((fr) => fr.result === 'Pass').length || 0}/{categoryResult.factorResults?.length || 0}
              </div>
            </div>

            {categoryResult.summary && (
              <div className="mb-4">
                <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult.summary) }} />
              </div>
            )}

            {categoryResult.factorResults?.length ? (
              <ul className="space-y-3">
                {categoryResult.factorResults.map((factor) => (
                  <li key={factor.factorKey} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {factor.result === 'Pass' ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                          )}
                          <h4 className="font-semibold">{getFactorTitle(categoryKey, factor.factorKey)}</h4>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            factor.result === 'Pass' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {factor.result}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{factor.oneLineExplanation}</p>
                      <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(factor.detailedExplanation) }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}

export default function EtfAnalysisSections({ data }: { data: EtfAnalysisResponse }): JSX.Element | null {
  if (!data.categories || data.categories.length === 0) {
    return null;
  }

  return (
    <>
      <EtfSummaryAnalysis data={data} />
      <EtfDetailedAnalysis data={data} />
    </>
  );
}

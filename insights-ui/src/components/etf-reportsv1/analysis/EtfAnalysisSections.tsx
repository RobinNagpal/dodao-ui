'use client';

import { EtfAnalysisResponse, EtfCategoryAnalysisResultResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { useState } from 'react';

const CATEGORY_DISPLAY: Record<string, { name: string; order: number }> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: { name: 'Performance & Returns', order: 1 },
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: { name: 'Cost, Efficiency & Team', order: 2 },
  [EtfAnalysisCategory.RiskAnalysis]: { name: 'Risk Analysis', order: 3 },
};

function FactorResult({
  factorKey,
  oneLineExplanation,
  detailedExplanation,
  result,
}: {
  factorKey: string;
  oneLineExplanation: string;
  detailedExplanation: string;
  result: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPassing = result === 'Pass';

  return (
    <div className="border border-gray-700 rounded-lg p-3 mb-2">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left flex items-start gap-3">
        <span
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
            isPassing ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}
        >
          {isPassing ? '✓' : '✗'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{oneLineExplanation}</div>
        </div>
        <span className="text-gray-400 text-xs flex-shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && <div className="mt-3 ml-8 text-sm text-gray-300 whitespace-pre-wrap">{detailedExplanation}</div>}
    </div>
  );
}

function CategorySection({ category }: { category: EtfCategoryAnalysisResultResponse }) {
  const display = CATEGORY_DISPLAY[category.categoryKey] || { name: category.categoryKey, order: 99 };
  const passCount = category.factorResults.filter((f) => f.result === 'Pass').length;
  const totalCount = category.factorResults.length;

  return (
    <section className="bg-gray-900 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{display.name}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${passCount >= totalCount / 2 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
        >
          {passCount}/{totalCount} Pass
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-4">{category.summary}</p>
      <div>
        {category.factorResults.map((factor) => (
          <FactorResult key={factor.factorKey} {...factor} />
        ))}
      </div>
    </section>
  );
}

export default function EtfAnalysisSections({ data }: { data: EtfAnalysisResponse }): JSX.Element | null {
  if (!data.categories || data.categories.length === 0) {
    return null;
  }

  const sorted = [...data.categories].sort((a, b) => {
    const orderA = CATEGORY_DISPLAY[a.categoryKey]?.order ?? 99;
    const orderB = CATEGORY_DISPLAY[b.categoryKey]?.order ?? 99;
    return orderA - orderB;
  });

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">ETF Analysis</h2>
      {sorted.map((category) => (
        <CategorySection key={category.categoryKey} category={category} />
      ))}
    </div>
  );
}

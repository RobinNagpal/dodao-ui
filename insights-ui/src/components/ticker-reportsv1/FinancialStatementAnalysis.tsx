import type { FinancialStatementAnalysisResponse } from '@/types/ticker-typesv1';
import React from 'react';
import TickerCategoryReport from './TickerCategoryReport';

export interface FinancialStatementAnalysisProps {
  tickerData: FinancialStatementAnalysisResponse['ticker'];
  data: FinancialStatementAnalysisResponse;
}

export default function FinancialStatementAnalysis({ tickerData, data }: FinancialStatementAnalysisProps): JSX.Element | null {
  const { categoryResult } = data;

  if (!tickerData || !categoryResult) {
    return null;
  }

  const ticker = tickerData.symbol;

  const analysisTitle = `${tickerData.name} (${ticker}) Financial Statement Analysis`;

  return (
    <TickerCategoryReport
      tickerData={tickerData}
      categoryResult={categoryResult}
      analysisTitle={analysisTitle}
      categoryBadgeText="Financial Statements"
      categoryBadgeClassName="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300"
      pageSlug="financial-statement-analysis"
    />
  );
}

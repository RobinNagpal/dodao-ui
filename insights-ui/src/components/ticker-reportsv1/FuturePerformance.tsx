import type { FuturePerformanceResponse } from '@/types/ticker-typesv1';
import React from 'react';
import TickerCategoryReport from './TickerCategoryReport';

export interface FuturePerformanceProps {
  tickerData: FuturePerformanceResponse['ticker'];
  data: FuturePerformanceResponse;
}

export default function FuturePerformance({ tickerData, data }: FuturePerformanceProps): JSX.Element | null {
  const { categoryResult } = data;

  if (!tickerData || !categoryResult) {
    return null;
  }

  const ticker = tickerData.symbol;

  const analysisTitle = `${tickerData.name} (${ticker}) Future Performance Analysis`;

  return (
    <TickerCategoryReport
      tickerData={tickerData}
      categoryResult={categoryResult}
      analysisTitle={analysisTitle}
      categoryBadgeText="Future Performance"
      categoryBadgeClassName="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300"
    />
  );
}

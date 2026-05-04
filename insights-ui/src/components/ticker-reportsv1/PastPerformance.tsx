import type { PastPerformanceResponse } from '@/types/ticker-typesv1';
import React from 'react';
import TickerCategoryReport from './TickerCategoryReport';

export interface PastPerformanceProps {
  tickerData: PastPerformanceResponse['ticker'];
  data: PastPerformanceResponse;
}

export default function PastPerformance({ tickerData, data }: PastPerformanceProps): JSX.Element | null {
  const { categoryResult } = data;

  if (!tickerData || !categoryResult) {
    return null;
  }

  const ticker = tickerData.symbol;

  const analysisTitle = `${tickerData.name} (${ticker}) Past Performance Analysis`;

  return (
    <TickerCategoryReport
      tickerData={tickerData}
      categoryResult={categoryResult}
      analysisTitle={analysisTitle}
      categoryBadgeText="Past Performance"
      categoryBadgeClassName="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
      pageSlug="past-performance"
    />
  );
}

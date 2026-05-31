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
      categoryBadgeClassName="bg-indigo-500/15 border border-indigo-500/40 text-indigo-300"
      pageSlug="future-performance"
    />
  );
}

import type { BusinessAndMoatResponse } from '@/types/ticker-typesv1';
import React from 'react';
import TickerCategoryReport from './TickerCategoryReport';

export interface BusinessAndMoatProps {
  tickerData: BusinessAndMoatResponse['ticker'];
  data: BusinessAndMoatResponse;
}

export default function BusinessAndMoat({ tickerData, data }: BusinessAndMoatProps): JSX.Element | null {
  const { categoryResult } = data;

  if (!tickerData || !categoryResult) {
    return null;
  }

  const ticker = tickerData.symbol;

  const analysisTitle = `${tickerData.name} (${ticker}) Business & Moat Analysis`;

  return (
    <TickerCategoryReport
      tickerData={tickerData}
      categoryResult={categoryResult}
      analysisTitle={analysisTitle}
      categoryBadgeText="Business & Moat"
      categoryBadgeClassName="bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300"
    />
  );
}

import type { FairValueResponse } from '@/types/ticker-typesv1';
import React from 'react';
import TickerCategoryReport from './TickerCategoryReport';

export interface FairValueProps {
  tickerData: FairValueResponse['ticker'];
  data: FairValueResponse;
}

export default function FairValue({ tickerData, data }: FairValueProps): JSX.Element | null {
  const { categoryResult } = data;

  if (!tickerData || !categoryResult) {
    return null;
  }

  const ticker = tickerData.symbol;

  const analysisTitle = `${tickerData.name} (${ticker}) Fair Value Analysis`;

  return (
    <TickerCategoryReport
      tickerData={tickerData}
      categoryResult={categoryResult}
      analysisTitle={analysisTitle}
      categoryBadgeText="Fair Value"
      categoryBadgeClassName="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300"
    />
  );
}

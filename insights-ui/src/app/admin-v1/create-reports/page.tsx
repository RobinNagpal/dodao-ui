'use client';

import TickerSelectionPage from '@/app/admin-v1/TickerSelectionPage';
import ReportGenerator from '@/components/public-equitiesv1/ReportGenerator';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default function CreateReportsV1Page(): JSX.Element {
  return (
    <TickerSelectionPage
      fetchTickerDataUrl={(ticker) => `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}`}
      refreshButtonText="Refresh Reports"
      renderActionComponent={({ selectedTickers, tickerData, onDataUpdated }) => (
        <ReportGenerator selectedTickers={selectedTickers} tickerReports={tickerData} onReportGenerated={onDataUpdated} />
      )}
    />
  );
}

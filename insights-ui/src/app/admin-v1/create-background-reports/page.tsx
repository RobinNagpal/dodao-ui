'use client';

import TickerSelectionPage from '@/app/admin-v1/TickerSelectionPage';
import RequestGenerator from '@/components/public-equitiesv1/RequestGenerator';
import { TickerRequestV1 } from '@/types/public-equity/analysis-factors-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default function CreateBackgroundReportsV1Page(): JSX.Element {
  return (
    <TickerSelectionPage<TickerRequestV1>
      fetchTickerDataUrl={(ticker) => `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/generation-request`}
      refreshButtonText="Refresh Requests"
      renderActionComponent={({ selectedTickers, tickerData, onDataUpdated }) => (
        <RequestGenerator selectedTickers={selectedTickers} tickerRequests={tickerData} onRequestCreated={onDataUpdated} />
      )}
    />
  );
}

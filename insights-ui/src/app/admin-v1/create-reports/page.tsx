'use client';

import TickerSelectionPage from '@/app/admin-v1/TickerSelectionPage';
import ReportGenerator from '@/components/public-equitiesv1/ReportGenerator';

export default function CreateReportsV1Page(): JSX.Element {
  return (
    <TickerSelectionPage
      refreshButtonText="Refresh Reports"
      renderActionComponent={({ selectedTickers, tickerData, onDataUpdated }) => (
        <ReportGenerator selectedTickers={selectedTickers} tickerReports={tickerData} onReportGenerated={onDataUpdated} />
      )}
    />
  );
}

import { getTickerReport, initializeNewTickerReport, saveTickerReport, triggerCriteriaMatching } from '@/lib/publicEquity';
import { ProcessingStatus, TickerReport } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// app/api/public-equity/single-criterion-report/route.ts
import { NextRequest } from 'next/server';

const triggerCriteriaMatchingForTicker = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<TickerReport> => {
  const { tickerKey } = await params;
  const tickerReport = await getTickerReport(tickerKey);
  await initializeNewTickerReport(tickerKey, tickerReport.selectedSector.id, tickerReport.selectedIndustryGroup.id);
  await triggerCriteriaMatching(tickerKey, false);
  const updatedReport: TickerReport = {
    ...tickerReport,
    criteriaMatchesOfLatest10Q: {
      status: ProcessingStatus.InProgress,
    },
  };
  await saveTickerReport(tickerKey, updatedReport);

  return updatedReport;
};

export const POST = withErrorHandlingV2<TickerReport>(triggerCriteriaMatchingForTicker);

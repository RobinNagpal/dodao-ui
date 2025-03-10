import {
  CriterionMatchesOfLatest10Q,
  getCriteria,
  getTickerReport,
  initializeNewTickerReport,
  saveTickerReport,
  TickerReport,
  triggerCriteriaMatching,
} from '@/lib/publicEquity';
import { ProcessingStatus } from '@/types/public-equity/ticker-report';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// app/api/public-equity/single-criterion-report/route.ts
import { NextRequest } from 'next/server';

const triggerCriteriaMatchingForTicker = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<TickerReport> => {
  const { tickerKey } = await params;
  const tickerReport = await getTickerReport(body.ticker);
  await initializeNewTickerReport(tickerKey, tickerReport.selectedSector.id, tickerReport.selectedIndustryGroup.id);
  await triggerCriteriaMatching(tickerKey, false);
  const criteria = await getCriteria(tickerReport.selectedSector.name, tickerReport.selectedIndustryGroup.name);
  const criteriaMatches: CriterionMatchesOfLatest10Q[] = criteria.criteria.map((criterion) => ({
    criterionKey: criterion.key,
    status: ProcessingStatus.InProgress,
  }));
  const updatedReport = { ...tickerReport, criteriaMatchesOfLatest10Q: criteriaMatches };
  await saveTickerReport(tickerKey, updatedReport);

  return updatedReport;
};

export const POST = withErrorHandlingV2<TickerReport>(triggerCriteriaMatchingForTicker);

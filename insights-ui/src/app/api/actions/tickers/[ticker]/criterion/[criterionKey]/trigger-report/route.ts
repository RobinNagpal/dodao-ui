import { getCriteria, getTickerReport } from '@/lib/publicEquity';
import { CriteriaEvaluation, ProcessingStatus } from '@/types/public-equity/ticker-report';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// app/api/public-equity/single-criterion-report/route.ts
import { NextRequest } from 'next/server';

// You should define this environment variable in your project.
const PE_US_REITS_WEBHOOK_URL = process.env.PE_US_REITS_WEBHOOK_URL!;

const criterionReport = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }): Promise<CriteriaEvaluation> => {
  const { tickerKey, criterionKey } = await params;
  const tickerReport = await getTickerReport(tickerKey);
  const industryGroupCriteria = await getCriteria(tickerReport.selectedSector.name, tickerReport.selectedIndustryGroup.name);
  const matchingCriterion = industryGroupCriteria.criteria.find((crit) => crit.key === criterionKey);
  if (!matchingCriterion) {
    throw new Error(`Criterion with key '${criterionKey}' not found.`);
  }
  const payload = {
    ticker: tickerKey,
    shouldTriggerNext: false,
    criterion: JSON.stringify(matchingCriterion),
  };
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(PE_US_REITS_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const jsonResponse = await response.json();
  console.log(jsonResponse);
  return {
    criterionKey,
    importantMetrics: {
      status: ProcessingStatus.InProgress,
    },
  };
};
export const POST = withErrorHandlingV2<CriteriaEvaluation>(criterionReport);

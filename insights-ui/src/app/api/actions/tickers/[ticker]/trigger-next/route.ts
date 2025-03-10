// app/api/public-equity/next-criterion-report/route.ts
import { ProcessingStatus } from '@/types/public-equity/ticker-report';
import { NextCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getTickerReport, getCriteria } from '@/lib/publicEquity';

const PE_US_REITS_WEBHOOK_URL = process.env.PE_US_REITS_WEBHOOK_URL!;

const triggerNext = async (req: NextRequest) => {
  const body = (await req.json()) as NextCriterionReportRequest;
  if (!body.shouldTriggerNext) {
    return {
      success: true,
      message: 'shouldTriggerNext flag is false. Not triggering next criterion report.',
    };
  }
  const tickerReport = await getTickerReport(body.ticker);
  const industryGroupCriteria = await getCriteria(tickerReport.selectedSector.name, tickerReport.selectedIndustryGroup.name);
  const criteriaList = industryGroupCriteria.criteria;
  const currentIndex = criteriaList.findIndex((crit) => crit.key === body.criterionKey);
  if (currentIndex === -1) {
    throw new Error(`Criterion with key '${body.criterionKey}' not found.`);
  }
  if (currentIndex + 1 >= criteriaList.length) {
    return {
      success: true,
      message: 'This was the last criterion. No next criterion to process.',
    };
  }
  const nextCriterion = criteriaList[currentIndex + 1];
  const payloadShouldTriggerNext = currentIndex + 1 === criteriaList.length - 1 ? false : true;
  const payload = {
    ticker: body.ticker,
    shouldTriggerNext: payloadShouldTriggerNext,
    criterion: JSON.stringify(nextCriterion),
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
    status: ProcessingStatus.InProgress,
  };
};
export const POST = withErrorHandlingV2(triggerNext);

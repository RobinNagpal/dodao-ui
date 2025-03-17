import { getCriteria } from '@/lib/industryGroupCriteria';
import { getTickerReport, saveTickerReport } from '@/lib/publicEquity';
import { CriterionEvaluation, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { CreateAllCriterionReportsRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

import { NextRequest } from 'next/server';

const triggerAllCriterionReports = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }
): Promise<CriterionEvaluation> => {
  const { tickerKey, criterionKey } = await params;
  const body = (await req.json()) as CreateAllCriterionReportsRequest;

  if (!body.langflowWebhookUrl) {
    throw new Error('langflowWebhookUrl is required in the request body.');
  }

  const tickerReport = await getTickerReport(tickerKey);
  const industryGroupCriteria = await getCriteria(tickerReport.selectedSector.name, tickerReport.selectedIndustryGroup.name);
  const matchingCriterion = industryGroupCriteria.criteria.find((crit) => crit.key === criterionKey);
  if (!matchingCriterion) {
    throw new Error(`Criterion with key '${criterionKey}' not found.`);
  }
  const payload = {
    ticker: tickerKey,
    shouldTriggerNext: false,
    reportKey: [...matchingCriterion.reports.map((r) => r.key), 'performanceChecklist', 'importantMetrics'].join(','),
    criterion: JSON.stringify(matchingCriterion),
  };
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(body.langflowWebhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const jsonResponse = await response.json();
  console.log(jsonResponse);
  const criterionEvaluation = {
    criterionKey,
    importantMetrics: {
      status: ProcessingStatus.InProgress,
    },
    performanceChecklistEvaluation: {
      status: ProcessingStatus.InProgress,
    },
    reports: industryGroupCriteria.criteria
      .flatMap((c) => c.reports)
      .map((r) => ({
        reportKey: r.key,
        status: ProcessingStatus.InProgress,
      })),
  };
  await saveTickerReport(tickerKey, {
    ...tickerReport,
    evaluationsOfLatest10Q: [...(tickerReport.evaluationsOfLatest10Q || []).map((e) => (e.criterionKey === criterionKey ? criterionEvaluation : e))],
  });
  return criterionEvaluation;
};
export const POST = withErrorHandlingV2<CriterionEvaluation>(triggerAllCriterionReports);

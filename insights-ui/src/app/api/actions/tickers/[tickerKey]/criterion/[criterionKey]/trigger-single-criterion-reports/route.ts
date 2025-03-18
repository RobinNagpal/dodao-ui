import { getCriteria } from '@/lib/industryGroupCriteria';
import { getTickerReport, saveTickerReport } from '@/lib/publicEquity';
import { CriterionEvaluation, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

import { NextRequest } from 'next/server';

const triggerSingleCriterionReport = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }
): Promise<CriterionEvaluation> => {
  const { tickerKey, criterionKey } = await params;
  const body = (await req.json()) as CreateSingleCriterionReportRequest;
  if (!body.langflowWebhookUrl) {
    throw new Error('langflowWebhookUrl is required in the request body.');
  }

  const tickerReport = await getTickerReport(tickerKey);
  const industryGroupCriteria = await getCriteria(tickerReport.selectedSector.name, tickerReport.selectedIndustryGroup.name);
  const matchingCriterion = industryGroupCriteria.criteria.find((crit) => crit.key === criterionKey);
  if (!matchingCriterion) {
    throw new Error(`Criterion with key '${criterionKey}' not found.`);
  }
  const reportKey = body.reportKey;
  const payload = {
    ticker: tickerKey,
    shouldTriggerNext: false,
    reportKey: reportKey,
    criterion: JSON.stringify(matchingCriterion),
  };
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(body.langflowWebhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  let updatedCriterionEvaluation: CriterionEvaluation | undefined = tickerReport.evaluationsOfLatest10Q?.find((e) => e.criterionKey === criterionKey);
  if (!updatedCriterionEvaluation) {
    updatedCriterionEvaluation = {
      criterionKey,
      importantMetrics: {
        status: ProcessingStatus.NotStarted,
      },
      performanceChecklistEvaluation: {
        status: ProcessingStatus.NotStarted,
      },
      reports:
        industryGroupCriteria.criteria
          .find((c) => c.key === criterionKey)
          ?.reports.map((r) => ({
            reportKey: r.key,
            status: ProcessingStatus.NotStarted,
          })) || [],
    };
  }
  if (reportKey === 'importantMetrics') {
    updatedCriterionEvaluation.importantMetrics = {
      status: ProcessingStatus.InProgress,
    };
  } else if (reportKey === 'performanceChecklist') {
    updatedCriterionEvaluation.performanceChecklistEvaluation = {
      status: ProcessingStatus.InProgress,
    };
  } else {
    const report = updatedCriterionEvaluation.reports?.find((r) => r.reportKey === reportKey);
    if (report) {
      report.status = ProcessingStatus.InProgress;
    } else {
      updatedCriterionEvaluation.reports?.push({
        reportKey,
        status: ProcessingStatus.InProgress,
      });
    }
  }
  let evaluationsOfLatest10Q = [...(tickerReport.evaluationsOfLatest10Q || [])];
  if (!evaluationsOfLatest10Q || evaluationsOfLatest10Q.length === 0) {
    evaluationsOfLatest10Q = [updatedCriterionEvaluation];
  } else {
    const index = evaluationsOfLatest10Q.findIndex((e) => e.criterionKey === criterionKey);
    if (index === -1) {
      evaluationsOfLatest10Q.push(updatedCriterionEvaluation);
    } else {
      evaluationsOfLatest10Q[index] = updatedCriterionEvaluation;
    }
  }
  console.log('Saving ticker report with updated evaluationsOfLatest10Q:', JSON.stringify(evaluationsOfLatest10Q, null, 2));
  await saveTickerReport(tickerKey, {
    ...tickerReport,
    evaluationsOfLatest10Q: evaluationsOfLatest10Q,
  });

  const responseJson = await response.json();
  console.log('Response from langflow:', responseJson);

  return updatedCriterionEvaluation;
};
export const POST = withErrorHandlingV2<CriterionEvaluation>(triggerSingleCriterionReport);

import { getTickerReport, saveCriteriaEvaluation, saveTickerReport } from '@/lib/publicEquity';
import { CriterionEvaluation, ProcessingStatus, CriterionReportItem } from '@/types/public-equity/ticker-report-types';
import { SaveCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const savePerformanceChecklistForCriterion = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }
): Promise<CriterionReportItem> => {
  const { tickerKey, criterionKey } = await params;
  const body = (await req.json()) as SaveCriterionReportRequest;
  const tickerReport = await getTickerReport(tickerKey);
  const evaluations = tickerReport.evaluationsOfLatest10Q || [];
  const matchingEvaluation = evaluations.find((e) => e.criterionKey === criterionKey);
  if (!matchingEvaluation) {
    throw new Error(`Evaluation with key '${criterionKey}' not found.`);
  }

  const reportValue = matchingEvaluation.reports?.find((r) => r.reportKey === body.reportKey);
  if (!reportValue) {
    throw new Error(`Report with key '${body.reportKey}' not found.`);
  }

  const outputFileUrl = await saveCriteriaEvaluation(tickerKey, criterionKey, body.reportKey, body.data);

  const updatedReportValue: CriterionReportItem = {
    reportKey: body.reportKey,
    status: ProcessingStatus.Completed,
    outputFileUrl,
  };

  const updatedReports = matchingEvaluation.reports?.map((r) => (r.reportKey === body.reportKey ? updatedReportValue : r));

  const updatedEvaluation: CriterionEvaluation = {
    ...matchingEvaluation,
    reports: updatedReports,
  };

  const updatedTickerReport = {
    ...tickerReport,
    evaluationsOfLatest10Q: evaluations.map((e) => (e.criterionKey === criterionKey ? updatedEvaluation : e)),
  };

  await saveTickerReport(tickerKey, updatedTickerReport);

  return updatedReportValue;
};

export const POST = withErrorHandlingV2<CriterionReportItem>(savePerformanceChecklistForCriterion);

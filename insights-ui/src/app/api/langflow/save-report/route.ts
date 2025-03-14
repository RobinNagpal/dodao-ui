import { getTickerReport, saveCriteriaEvaluation, saveTickerReport } from '@/lib/publicEquity';
import { CriterionEvaluation, ProcessingStatus, CriterionReportItem } from '@/types/public-equity/ticker-report-types';
import { SaveCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const savePerformanceChecklistForCriterion = async (req: NextRequest): Promise<CriterionReportItem> => {
  const body = (await req.json()) as SaveCriterionReportRequest;
  const tickerReport = await getTickerReport(body.ticker);
  const evaluations = tickerReport.evaluationsOfLatest10Q || [];
  let matchingEvaluation = evaluations.find((e) => e.criterionKey === body.criterionKey);
  console.log('matchingEvaluation', matchingEvaluation);
  // If no matching evaluation exists, create one
  if (!matchingEvaluation) {
    matchingEvaluation = {
      criterionKey: body.criterionKey,
      reports: [],
    } as CriterionEvaluation;

    evaluations.push(matchingEvaluation);
  }
  
  const outputFileUrl = await saveCriteriaEvaluation(body.ticker, body.criterionKey, body.reportKey, body.data);

  const updatedReportValue: CriterionReportItem = {
    reportKey: body.reportKey,
    status: ProcessingStatus.Completed,
    outputFileUrl,
  };
  console.log('updatedReportValue', updatedReportValue);
   // Ensure reports array is populated correctly
   const updatedReports = matchingEvaluation.reports ? [...matchingEvaluation.reports] : [];

   const existingReportIndex = updatedReports.findIndex((r) => r.reportKey === body.reportKey);
   if (existingReportIndex !== -1) {
     updatedReports[existingReportIndex] = updatedReportValue; // Update existing report
   } else {
     updatedReports.push(updatedReportValue); // Add new report
   }
   console.log('updatedReports', updatedReports);
   
  const updatedEvaluation: CriterionEvaluation = {
    ...matchingEvaluation,
    reports: updatedReports,
  };

  const updatedTickerReport = {
    ...tickerReport,
    evaluationsOfLatest10Q: evaluations.map((e) => (e.criterionKey === body.criterionKey ? updatedEvaluation : e)),
  };

  await saveTickerReport(body.ticker, updatedTickerReport);

  return updatedReportValue;
};

export const POST = withErrorHandlingV2<CriterionReportItem>(savePerformanceChecklistForCriterion);

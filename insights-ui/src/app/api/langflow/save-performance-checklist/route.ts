import { parseLangflowJSON } from '@/lib/langflow';
import { getTickerReport, savePerformanceChecklist, saveTickerReport } from '@/lib/publicEquity';
import { CriterionEvaluation, PerformanceChecklistEvaluation, PerformanceChecklistItem, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SavePerformanceChecklistRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const savePerformanceChecklistForCriterion = async (req: NextRequest): Promise<PerformanceChecklistEvaluation> => {
  const body = (await req.json()) as SavePerformanceChecklistRequest;
  const tickerReport = await getTickerReport(body.ticker);
  const evaluations = tickerReport.evaluationsOfLatest10Q || [];
  const performanceChecklist: PerformanceChecklistItem[] =
    typeof body.performanceChecklist === 'string' ? parseLangflowJSON(body.performanceChecklist) : body.performanceChecklist;
  await savePerformanceChecklist(body.ticker, body.criterionKey, performanceChecklist);
  const evaluation: CriterionEvaluation | undefined = evaluations.find((e) => e.criterionKey === body.criterionKey);
  if (!evaluation) {
    throw new Error(`Evaluation with key '${body.criterionKey}' not found.`);
  }

  const checklist: PerformanceChecklistEvaluation = {
    status: ProcessingStatus.Completed,
    performanceChecklist: performanceChecklist,
  };
  evaluation.performanceChecklistEvaluation = checklist;

  tickerReport.evaluationsOfLatest10Q = evaluations;
  await saveTickerReport(body.ticker, tickerReport);
  return checklist;
};

export const POST = withErrorHandlingV2<PerformanceChecklistEvaluation>(savePerformanceChecklistForCriterion);

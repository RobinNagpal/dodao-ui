import {
  CriteriaEvaluation,
  getTickerFileKey,
  getTickerReport,
  savePerformanceChecklist,
  SavePerformanceChecklistRequest,
  uploadToS3,
} from '@/lib/publicEquity';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const savePerformanceChecklistForCriterion = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }
): Promise<CriteriaEvaluation> => {
  const { tickerKey, criterionKey } = await params;
  const body = (await req.json()) as SavePerformanceChecklistRequest;
  const tickerReport = await getTickerReport(tickerKey);
  const evaluations = tickerReport.evaluationsOfLatest10Q || [];
  await savePerformanceChecklist(
    body.ticker,
    body.criterionKey,
    typeof body.performanceChecklist === 'string' ? JSON.parse(body.performanceChecklist) : body.performanceChecklist
  );
  let evaluation = evaluations.find((e) => e.criterionKey === criterionKey);
  if (!evaluation) {
    evaluation = {
      criterionKey: criterionKey,
      performanceChecklist: typeof body.performanceChecklist === 'string' ? JSON.parse(body.performanceChecklist) : body.performanceChecklist,
      importantMetrics: undefined,
      reports: undefined,
    };
    evaluations.push(evaluation);
  } else {
    evaluation.performanceChecklist = typeof body.performanceChecklist === 'string' ? JSON.parse(body.performanceChecklist) : body.performanceChecklist;
  }
  tickerReport.evaluationsOfLatest10Q = evaluations;
  const tickerFileKey = getTickerFileKey(body.ticker);
  await uploadToS3(JSON.stringify(tickerReport, null, 2), tickerFileKey, 'application/json');
  return evaluation;
};

export const POST = withErrorHandlingV2<CriteriaEvaluation>(savePerformanceChecklistForCriterion);

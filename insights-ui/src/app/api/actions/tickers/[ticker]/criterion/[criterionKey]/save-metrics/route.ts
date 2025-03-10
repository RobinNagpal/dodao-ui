// app/api/public-equity/create-single-report/route.ts

import { getTickerFileKey, getTickerReport, uploadToS3 } from '@/lib/publicEquity';
import { CriterionEvaluation, ImportantMetrics, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SaveCriterionMetricsRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const saveMetrics = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }): Promise<ImportantMetrics> => {
  const { tickerKey, criterionKey } = await params;
  const body = (await req.json()) as SaveCriterionMetricsRequest;
  const tickerReport = await getTickerReport(tickerKey);
  const evaluations = tickerReport.evaluationsOfLatest10Q || [];
  let evaluation: CriterionEvaluation | undefined = evaluations.find((e) => e.criterionKey === body.criterionKey);
  const newMetrics: ImportantMetrics = {
    status: ProcessingStatus.Completed,
    metrics: typeof body.metrics === 'string' ? JSON.parse(body.metrics) : body.metrics,
  };
  if (!evaluation) {
    evaluation = {
      criterionKey: criterionKey,
      importantMetrics: newMetrics,
      reports: undefined,
      performanceChecklistEvaluation: undefined,
    };
    evaluations.push(evaluation);
  } else {
    evaluation.importantMetrics = newMetrics;
  }
  tickerReport.evaluationsOfLatest10Q = evaluations;
  const tickerFileKey = getTickerFileKey(body.ticker);
  await uploadToS3(JSON.stringify(tickerReport, null, 2), tickerFileKey, 'application/json');
  return newMetrics;
};
export const POST = withErrorHandlingV2<ImportantMetrics>(saveMetrics);

import { parseLangflowJSON } from '@/lib/langflow';
import { prisma } from '@/prisma';
import { ImportantMetrics, MetricValueItem, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SaveCriterionMetricsRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const saveMetrics = async (req: NextRequest): Promise<ImportantMetrics> => {
  const body = (await req.json()) as SaveCriterionMetricsRequest;

  const tickerReport = await prisma.ticker.findUniqueOrThrow({
    where: { tickerKey: body.ticker },
    include: { evaluationsOfLatest10Q: true },
  });

  if (!tickerReport) {
    throw new Error(`Ticker not found for key: ${body.ticker}`);
  }

  const metricsRaw = body.metrics;
  const checklistItems: MetricValueItem[] = typeof metricsRaw === 'string' ? parseLangflowJSON(metricsRaw) : metricsRaw;

  const newMetrics = await prisma.importantMetricsEvaluation.update({
    where: {
      tickerKey_criterionKey: {
        tickerKey: body.ticker,
        criterionKey: body.criterionKey,
      },
    },

    data: {
      status: ProcessingStatus.Completed,
      metrics: {
        create: checklistItems.map((m: { metricKey: any; value: any; calculationExplanation: any }) => ({
          metricKey: m.metricKey,
          value: m.value,
          calculationExplanation: m.calculationExplanation,
          tickerKey: body.ticker,
          criterionKey: body.criterionKey,
        })),
      },
    },
    include: {
      metrics: true,
    },
  });

  return newMetrics;
};

export const POST = withErrorHandlingV2<ImportantMetrics>(saveMetrics);

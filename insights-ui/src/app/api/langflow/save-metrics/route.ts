import { parseLangflowJSON } from '@/lib/langflow';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ImportantMetrics, MetricValueItem, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SaveCriterionMetricsRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const saveMetrics = async (req: NextRequest): Promise<ImportantMetrics> => {
  const body = (await req.json()) as SaveCriterionMetricsRequest;

  const tickerReport = await prisma.ticker.findUnique({
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
      spaceId_tickerKey_criterionKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey: body.ticker,
        criterionKey: body.criterionKey,
      },
    },

    data: {
      status: ProcessingStatus.Completed,
      metrics: {
        deleteMany: {
          criterionKey: body.criterionKey,
          tickerKey: body.ticker,
          spaceId: KoalaGainsSpaceId,
        },
        create: checklistItems.map((m: MetricValueItem) => ({
          metricKey: m.metricKey,
          value: m.value,
          calculationExplanation: m.calculationExplanation,
          tickerKey: body.ticker,
          criterionKey: body.criterionKey,
          allInformationUsed: m.allInformationUsed,
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

// app/api/public-equity/create-single-report/route.ts

import { prisma } from '@/prisma';
import { ImportantMetrics, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
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

  const metricsArray = typeof body.metrics === 'string' ? JSON.parse(body.metrics) : body.metrics;

  const newMetrics = await prisma.importantMetrics.upsert({
    where: {
      tickerKey_criterionKey: {
        tickerKey: body.ticker,
        criterionKey: body.criterionKey,
      },
    },
    create: {
      tickerKey: body.ticker,
      criterionKey: body.criterionKey,
      status: ProcessingStatus.InProgress,
      metrics: {
        create: metricsArray.map((m: { metricKey: any; value: any; calculationExplanation: any }) => ({
          metricKey: m.metricKey,
          value: m.value,
          calculationExplanation: m.calculationExplanation,
          tickerKey: body.ticker,
          criterionKey: body.criterionKey,
        })),
      },
    },
    update: {
      status: ProcessingStatus.InProgress,
      metrics: {
        deleteMany: {},
        create: metricsArray.map((m: { metricKey: any; value: any; calculationExplanation: any }) => ({
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

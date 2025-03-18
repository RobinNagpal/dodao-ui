// app/api/public-equity/create-single-report/route.ts

import { parseLangflowJSON } from '@/lib/langflow';
import { getTickerReport, saveTickerReport } from '@/lib/publicEquity';
import { prisma } from '@/prisma';
import { CriterionEvaluation, ImportantMetrics, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SaveCriterionMetricsRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const saveMetrics = async (req: NextRequest): Promise<ImportantMetrics> => {
  const body = (await req.json()) as SaveCriterionMetricsRequest;
  const tickerReport = await prisma.ticker.findUniqueOrThrow({ where: { tickerKey: body.ticker }, include: { evaluationsOfLatest10Q: true } });

  prisma.importantMetrics.update({
    where: {
      tickerKey_criterionKey: {
        criterionKey: body.criterionKey,
        tickerKey: body.ticker,
      },
    },
    data: {
      metrics: {
        upsert: {},
      },
      status: newMetrics.status,
    },
  });

  return newMetrics;
};
export const POST = withErrorHandlingV2<ImportantMetrics>(saveMetrics);

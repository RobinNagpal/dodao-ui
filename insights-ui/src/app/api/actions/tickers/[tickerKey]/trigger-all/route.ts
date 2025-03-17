// app/api/public-equity/all-criterion-report/route.ts
import { TickerReport } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';

const PE_US_REITS_WEBHOOK_URL = process.env.PE_US_REITS_WEBHOOK_URL!;

const triggerAllReports = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }) => {
  const { tickerKey } = await params;

  const tickerReport = await prisma.tickerReport.findFirst({
    where: { tickerKey },
  });
  if (!tickerReport) {
    throw new Error(`No TickerReport found for tickerKey: ${tickerKey}`);
  }

  const firstCriterion = await prisma.criterionEvaluation.findFirst({
    where: {
      tickerKey: tickerReport.tickerKey,
    },
  });
  if (!firstCriterion) {
    throw new Error('No criteria found for the given sector/industry group.');
  }

  const payload = {
    ticker: tickerKey,
    shouldTriggerNext: true,
    criterion: JSON.stringify(firstCriterion),
  };
  const headers = { 'Content-Type': 'application/json' };
  // getting error on this line
  const response = await fetch(firstCriterion.langflowWebhookUrl || PE_US_REITS_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const jsonResponse = await response.json();
  console.log(jsonResponse);
  return tickerReport;
};
export const POST = withErrorHandlingV2<TickerReport>(triggerAllReports);

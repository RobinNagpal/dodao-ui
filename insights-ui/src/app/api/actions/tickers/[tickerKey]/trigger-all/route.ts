// app/api/public-equity/all-criterion-report/route.ts
import { TickerReportPrisma } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';

const PE_US_REITS_WEBHOOK_URL = process.env.PE_US_REITS_WEBHOOK_URL!;

async function postHandler(req: NextRequest, { params }: { params: { tickerKey: string } }): Promise<TickerReportPrisma> {
  const { tickerKey } = params;

  const tickerReport = await prisma.tickerReport.findFirst({
    where: { tickerKey },
  });

  if (!tickerReport) {
    throw new Error(`No TickerReport found for tickerKey: ${tickerKey}`);
  }

  const firstCriterion = await prisma.criterionEvaluation.findFirst({
    where: {
      tickerKey: tickerKey,
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
  const response = await fetch(PE_US_REITS_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const jsonResponse = await response.json();
  console.log(jsonResponse);
  return tickerReport;
}

export const POST = withErrorHandlingV2<TickerReportPrisma>(postHandler);

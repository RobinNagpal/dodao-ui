// app/api/public-equity/all-criterion-report/route.ts
import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

const PE_US_REITS_WEBHOOK_URL = process.env.PE_US_REITS_WEBHOOK_URL!;

const triggerAllReports = async (req: NextRequest, { params }: { params: { tickerKey: string } }): Promise<Ticker> => {
  const { tickerKey } = await params;

  const tickerReport = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (!tickerReport) {
    throw new Error(`Ticker report ${tickerKey} not found.`);
  }

  const industryGroupCriteria = await getCriteriaByIds(tickerReport.sectorId, tickerReport.industryGroupId);
  const firstCriterion = industryGroupCriteria.criteria[0];
  if (!firstCriterion) {
    throw new Error('Criteria list is empty.');
  }
  const payload = {
    ticker: tickerKey,
    shouldTriggerNext: true,
    criterion: JSON.stringify(firstCriterion),
  };
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(firstCriterion.langflowWebhookUrl || PE_US_REITS_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const jsonResponse = await response.json();
  console.log(jsonResponse);
  return tickerReport;
};
export const POST = withErrorHandlingV2<Ticker>(triggerAllReports);

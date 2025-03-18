// app/api/public-equity/all-criterion-report/route.ts
import { getGicsNames } from '@/lib/gicsHelper';
import { getCriteria } from '@/lib/industryGroupCriteria';
import { prisma } from '@/prisma';
import { Ticker } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
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

  const { sectorName, industryGroupName } = getGicsNames(tickerReport.sectorId, tickerReport.industryGroupId);

  const industryGroupCriteria = await getCriteria(sectorName, industryGroupName);
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

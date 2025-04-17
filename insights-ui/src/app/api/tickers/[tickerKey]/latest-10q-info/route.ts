import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { Latest10QInfoResponse } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const ticker = await prisma.ticker.findUnique({ where: { tickerKey } });
  if (!ticker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  const lambdaUrl = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/latest-10q-info';
  const payload = { ticker: tickerKey };
  const latest10qInfoResponse = await fetch(lambdaUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const latest10qInfo = await latest10qInfoResponse.json();
  if ('message' in latest10qInfo) {
    throw new Error(latest10qInfo.message);
  }

  const latest10QInfoData = latest10qInfo.data as Latest10QInfoResponse;

  await prisma.latest10QInfo.create({
    data: {
      tickerKey,
      spaceId: KoalaGainsSpaceId,
      filingUrl: latest10QInfoData.filingUrl,
      periodOfReport: latest10QInfoData.periodOfReport,
      filingDate: latest10QInfoData.filingDate,
      priceAtPeriodEnd: latest10QInfoData.priceAtPeriodEnd,
    },
  });

  return ticker;
}

export const POST = withErrorHandlingV2<Ticker>(postHandler);

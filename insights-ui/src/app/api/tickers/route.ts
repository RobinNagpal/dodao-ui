import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { Latest10QInfoResponse } from '@/types/public-equity/ticker-report-types';
import { TickerCreateRequest } from '@/types/public-equity/ticker-request-response';
import { invokePrompt } from '@/util/run-prompt';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(): Promise<Ticker[]> {
  const tickers = await prisma.ticker.findMany();
  return tickers;
}

async function postHandler(req: NextRequest): Promise<Ticker> {
  const { sectorId, industryGroupId, tickerKey, companyName, shortDescription }: TickerCreateRequest = await req.json();

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (existingTicker) {
    console.log(`Ticker already exists for ${tickerKey}`);
    return existingTicker;
  }

  const data: any = {
    tickerKey,
    sectorId,
    industryGroupId,
  };

  if (companyName && companyName.trim() !== '') {
    data.companyName = companyName;
  }
  if (shortDescription && shortDescription.trim() !== '') {
    data.shortDescription = shortDescription;
  }

  const newTicker = await prisma.ticker.create({
    data,
  });

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
      filingUrl: latest10QInfoData.filingUrl,
      periodOfReport: latest10QInfoData.periodOfReport,
      filingDate: latest10QInfoData.filingDate,
      priceAtPeriodEnd: latest10QInfoData.priceAtPeriodEnd,
    },
  });

  const inputJson = {
      tickerKey: newTicker.tickerKey,
      companyName: newTicker.companyName,
      shortDescription: newTicker.shortDescription,
      referenceDate: 'April 20, 2025',
    };
  
    const aboutTickerString = await invokePrompt('US/public-equities/real-estate/equity-reits/ticker-info', inputJson);

  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      tickerInfo: aboutTickerString,
    },
  });

  return updatedTicker;
}

export const GET = withErrorHandlingV2<Ticker[]>(getHandler);
export const POST = withErrorHandlingV2<Ticker>(postHandler);

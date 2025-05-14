import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';
import { SaveTickerBusinessModelRequest } from '@/types/public-equity/ticker-request-response';
import { invokePrompt } from '@/util/run-prompt';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { safeParseJsonString } from '@/util/safe-parse-json-string';

async function saveTickerBusinessModel(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }
  const inputJson = {
    tickerKey: existingTicker.tickerKey,
    companyName: existingTicker.companyName,
    shortDescription: existingTicker.shortDescription,
    referenceDate: getTodayDateAsMonthDDYYYYFormat(),
  };

  const tickerBusinessModelString = await invokePrompt('US/public-equities/real-estate/equity-reits/ticker-business-model', inputJson);

  const infoObj = safeParseJsonString(existingTicker.tickerInfo);

  infoObj.businessModel = JSON.parse(tickerBusinessModelString);

  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      tickerInfo: JSON.stringify(infoObj),
    },
  });

  return updatedTicker;
}

async function upsertTickerBusinessModel(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;
  const { tickerBusinessModel }: SaveTickerBusinessModelRequest = await req.json();

  const existingTicker = await prisma.ticker.findUnique({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
  });
  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  let infoObj: Record<string, any>;
  if (existingTicker.tickerInfo) {
    infoObj = JSON.parse(existingTicker.tickerInfo);
  } else {
    infoObj = {};
  }

  infoObj.businessModel = JSON.parse(tickerBusinessModel);

  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      tickerInfo: JSON.stringify(infoObj),
    },
  });

  return updatedTicker;
}

export const PUT = withErrorHandlingV2<Ticker>(upsertTickerBusinessModel);
export const POST = withErrorHandlingV2<Ticker>(saveTickerBusinessModel);

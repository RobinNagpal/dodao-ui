import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';
import { SaveTickerInfoRequest } from '@/types/public-equity/ticker-request-response';
import { invokePrompt } from '@/util/run-prompt';
import { getTodayDate } from '@/util/get-today-date';

async function saveTickerInfo(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
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
    referenceDate: getTodayDate(),
  };

  const aboutTickerString = await invokePrompt('US/public-equities/real-estate/equity-reits/ticker-info', inputJson);

  const aboutObj = JSON.parse(aboutTickerString);
  const existingInfoObj = JSON.parse(existingTicker.tickerInfo || '{}');

  if (existingInfoObj.tickerNews !== undefined) {
    aboutObj.tickerNews = existingInfoObj.tickerNews;
  }

  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      tickerInfo: JSON.stringify(aboutObj),
    },
  });

  return updatedTicker;
}

async function upsertTickerInfo(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;
  const { tickerInfo }: SaveTickerInfoRequest = await req.json();

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  const newCriteriaMatches = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      tickerInfo: tickerInfo,
    },
  });

  return newCriteriaMatches;
}

export const PUT = withErrorHandlingV2<Ticker>(upsertTickerInfo);
export const POST = withErrorHandlingV2<Ticker>(saveTickerInfo);

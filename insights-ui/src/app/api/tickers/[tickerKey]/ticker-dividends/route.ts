import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';
import { safeParseJsonString } from '@/util/safe-parse-json-string';

async function saveTickerFinancials(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  const infoObj = safeParseJsonString(existingTicker.tickerInfo);

  const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
  if (!POLYGON_API_KEY) throw new Error('POLYGON_API_KEY doesnt exist in the .env');

  const polygonEndpoint = `https://api.polygon.io/v3/reference/dividends?ticker=${tickerKey}&order=desc&limit=10&sort=ex_dividend_date&apiKey=${POLYGON_API_KEY}`;

  const resp = await fetch(polygonEndpoint);
  const dividends = await resp.json();

  infoObj.dividends = {
    dividends,
  };

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

export const POST = withErrorHandlingV2<Ticker>(saveTickerFinancials);

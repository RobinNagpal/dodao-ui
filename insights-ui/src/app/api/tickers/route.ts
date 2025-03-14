import { getTickerFileKey } from '@/lib/koalagainsS3Utils';
import { getTickerReport, initializeNewTickerReport } from '@/lib/publicEquity';
import { prisma } from '@/prisma';
import { TickerReport } from '@/types/public-equity/ticker-report-types';
import { TickerCreateRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(): Promise<Ticker[]> {
  const tickers = await prisma.ticker.findMany();
  return tickers;
}

async function postHandler(req: NextRequest): Promise<Ticker> {
  const { sectorId, industryGroupId, tickerKey }: TickerCreateRequest = await req.json();
  let tickerReport: TickerReport | undefined;
  try {
    tickerReport = await getTickerReport(tickerKey);
  } catch (error) {
    console.error('Error fetching ticker report:', error);
  }
  if (!tickerReport) {
    const reportUrl = await initializeNewTickerReport(tickerKey, sectorId, industryGroupId);
    console.log(`Initialized new ticker report for ${tickerKey} at ${reportUrl}`);

    const newTicker = await prisma.ticker.create({
      data: {
        tickerKey,
        sectorId,
        industryGroupId,
        reportUrl: reportUrl,
      },
    });

    return newTicker;
  } else {
    console.log(`Ticker report already exists for ${tickerKey}`);
    const newTicker = await prisma.ticker.create({
      data: {
        tickerKey,
        sectorId,
        industryGroupId,
        reportUrl: getTickerFileKey(tickerKey),
      },
    });
    return newTicker;
  }
}

export const GET = withErrorHandlingV2<Ticker[]>(getHandler);
export const POST = withErrorHandlingV2<Ticker>(postHandler);

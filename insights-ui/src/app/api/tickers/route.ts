import { prisma } from '@/prisma';
import { TickerCreateRequest } from '@/types/public-equity/ticker-request-response';
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

  const url = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/reporting_period_and_filing_link';
  const payload = { ticker: tickerKey };
  const ReportingPeriodAndFilingLinkResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const ReportingPeriodAndFilingLink = await ReportingPeriodAndFilingLinkResponse.json();
  console.log('ReportingPeriodAndFilingLink', ReportingPeriodAndFilingLink);
  if ('message' in ReportingPeriodAndFilingLink) {
    throw new Error(ReportingPeriodAndFilingLink.message);
  }

  const newLatest10QInfo = await prisma.latest10QInfo.create({
    data: {
      tickerKey,
      reportingPeriod: ReportingPeriodAndFilingLink.data[1],
      secFilingUrl: ReportingPeriodAndFilingLink.data[0],
      tickerId: newTicker.id,
    },
  });
  console.log('created new Latest10QInfo', newLatest10QInfo);
  console.log(`Created new ticker for ${tickerKey}`);
  return newTicker;
}

export const GET = withErrorHandlingV2<Ticker[]>(getHandler);
export const POST = withErrorHandlingV2<Ticker>(postHandler);

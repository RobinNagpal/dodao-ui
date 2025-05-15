import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { Latest10QInfoResponse } from '@/types/public-equity/ticker-report-types';
import { TickerCreateRequest } from '@/types/public-equity/ticker-request-response';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { invokePrompt } from '@/util/run-prompt';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Define response interface for paginated tickers
interface PaginatedTickersResponse {
  tickers: Ticker[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function getHandler(req: NextRequest): Promise<PaginatedTickersResponse> {
  // Extract pagination parameters from URL
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  // Ensure valid pagination parameters
  const validPage = isNaN(page) || page < 1 ? 1 : page;
  const validPageSize = isNaN(pageSize) || pageSize < 1 || pageSize > 100 ? 20 : pageSize;

  // Calculate skip value for pagination
  const skip = (validPage - 1) * validPageSize;

  // First, get total count for pagination metadata
  const totalCount = await prisma.ticker.count({
    where: {
      spaceId: KoalaGainsSpaceId,
    },
  });

  // Then fetch paginated tickers
  const tickers = await prisma.ticker.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      evaluationsOfLatest10Q: {
        include: {
          performanceChecklistEvaluation: {
            include: {
              performanceChecklistItems: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    skip,
    take: validPageSize,
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / validPageSize);

  return {
    tickers,
    totalCount,
    page: validPage,
    pageSize: validPageSize,
    totalPages,
  };
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
    referenceDate: getTodayDateAsMonthDDYYYYFormat(),
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

export const GET = withErrorHandlingV2<PaginatedTickersResponse>(getHandler);
export const POST = withErrorHandlingV2<Ticker>(postHandler);

import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';
import { SaveTickerFinancialsRequest } from '@/types/public-equity/ticker-request-response';
import { safeParseJsonString } from '@/util/safe-parse-json-string';
import { getLlmResponse } from '@/scripts/llm‑utils‑gemini';
import { z } from 'zod';

async function saveTickerFinancials(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  const averageDividendYieldSchema = z.object({
    averageDividendYield: z.number().describe('Average dividend yield of the REIT'),
  });
  const averageDividendYieldPrompt = `Tell me the average dividend yield % for the Equity REIT: ${existingTicker.companyName} (ticker: ${existingTicker.tickerKey})`;
  const { averageDividendYield } = await getLlmResponse<{ averageDividendYield: number }>(averageDividendYieldPrompt, averageDividendYieldSchema);

  const ffoPerShareSchema = z.object({
    ffoPerShareLastYear: z.number().describe('FFO per share of the REIT for last year'),
    ffoPerShareCurrentYear: z.number().describe('FFO per share of the REIT for current year'),
  });
  const ffoPerSharePrompt = `Tell me the FFO per share for the last year and FFO per share for this year for the Equity REIT: ${existingTicker.companyName} (ticker: ${existingTicker.tickerKey})`;
  const ffoPerShare = await getLlmResponse<{ ffoPerShareLastYear: number; ffoPerShareCurrentYear: number }>(ffoPerSharePrompt, ffoPerShareSchema);

  const priceToBookSchema = z.object({
    priceToBook: z.number().describe('Price per share to Book value per share of the REIT'),
  });
  const priceToBookPrompt = `Tell me the price per share to book value per share for the Equity REIT: ${existingTicker.companyName} (${existingTicker.tickerKey})`;
  const { priceToBook } = await getLlmResponse<{ priceToBook: number }>(priceToBookPrompt, priceToBookSchema);

  const infoObj = safeParseJsonString(existingTicker.tickerInfo);

  infoObj.financials = {
    averageDividendYield,
    ffoPerShare,
    priceToBook,
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

async function upsertTickerFinancials(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;
  const { tickerFinancials }: SaveTickerFinancialsRequest = await req.json();

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

  infoObj.financials = JSON.parse(tickerFinancials);

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

export const PUT = withErrorHandlingV2<Ticker>(upsertTickerFinancials);
export const POST = withErrorHandlingV2<Ticker>(saveTickerFinancials);

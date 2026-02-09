import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const triggerFinancialStatementsForTicker = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<string> => {
  const { tickerKey } = await params;

  const tickerRecord = await prisma.ticker.findUnique({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
  });

  if (tickerRecord && tickerRecord.latest10QFinancialStatements) {
    await prisma.ticker.update({
      where: {
        spaceId_tickerKey: {
          spaceId: KoalaGainsSpaceId,
          tickerKey,
        },
      },
      data: {
        latest10QFinancialStatements: null,
      },
    });
  }

  const url = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/financials';
  const payload = { ticker: tickerKey, force_refresh: true };
  const financialStatementsResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const financialStatements = (await financialStatementsResponse.json()) as { message?: string; data: string };

  if ('message' in financialStatements && financialStatements.message) {
    throw new Error(financialStatements.message);
  }
  return financialStatements.data;
};

export const POST = withErrorHandlingV2<string>(triggerFinancialStatementsForTicker);

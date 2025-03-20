import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SaveCriteriaMatchesOfLatest10QRequest, SaveLatest10QFinancialStatementsRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CriteriaMatchesOfLatest10Q, Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function saveLatest10QFinancialStatements(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;
  const { latest10QFinancialStatements }: SaveLatest10QFinancialStatementsRequest = await req.json();

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
      latest10QFinancialStatements: latest10QFinancialStatements,
    },
  });

  return newCriteriaMatches;
}

export const POST = withErrorHandlingV2<Ticker>(saveLatest10QFinancialStatements);

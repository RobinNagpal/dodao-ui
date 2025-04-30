import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const triggerCriteriaMatchingForTicker = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> => {
  const { tickerKey } = await params;
  const pythonBackendBaseUrl = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || 'https://ai-insights.dodao.io';
  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      criteriaMatchesOfLatest10Q: {
        upsert: {
          create: {
            tickerKey,
            spaceId: KoalaGainsSpaceId,
            status: ProcessingStatus.InProgress,
            failureReason: null,
            matchingAttachmentsCount: 0,
            matchingAttachmentsProcessedCount: 0,
            updatedAt: new Date(),
          },
          update: {
            status: ProcessingStatus.InProgress,
            failureReason: null,
            matchingAttachmentsCount: 0,
            matchingAttachmentsProcessedCount: 0,
            updatedAt: new Date(),
            criterionMatches: {
              deleteMany: {
                tickerKey,
                spaceId: KoalaGainsSpaceId,
              },
            },
          },
        },
      },
    },
    include: {
      criteriaMatchesOfLatest10Q: {
        include: {
          criterionMatches: true,
        },
      },
    },
  });
  console.log(`Updated ticker: ${JSON.stringify(updatedTicker)}`);

  const url = `${pythonBackendBaseUrl}/api/public-equities/US/populate-criteria-matches`;
  const payload = { ticker: tickerKey };
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return updatedTicker;
};

export const POST = withErrorHandlingV2<Ticker>(triggerCriteriaMatchingForTicker);

import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const triggerCriteriaMatchingForTicker = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> => {
  const { tickerKey } = await params;

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
          },
          update: {
            status: ProcessingStatus.InProgress,
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
          criterionMatches: {
            include: {
              matchedAttachments: true,
            },
          },
        },
      },
    },
  });
  console.log(`Updated ticker: ${JSON.stringify(updatedTicker)}`);
  

  const url = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/populate-criteria-matches';
  const payload = { ticker: tickerKey };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await response.text();
  return updatedTicker;
};

export const POST = withErrorHandlingV2<Ticker>(triggerCriteriaMatchingForTicker);

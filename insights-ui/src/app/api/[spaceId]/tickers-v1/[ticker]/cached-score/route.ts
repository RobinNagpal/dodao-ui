import { FullTickerV1CategoryAnalysisResult } from '@/utils/ticker-v1-model-utils';
import { CATEGORY_MAPPINGS } from '@/lib/mappingsV1';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<{ success: boolean }> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      categoryAnalysisResults: {
        include: {
          factorResults: {
            include: {
              analysisCategoryFactor: true,
            },
          },
        },
      },
      investorAnalysisResults: true,
      futureRisks: true,
      vsCompetition: true,
    },
  });

  const totalScore = Object.entries(CATEGORY_MAPPINGS)
    .map(([categoryKey]) => {
      const report: FullTickerV1CategoryAnalysisResult | undefined = (tickerRecord.categoryAnalysisResults || []).find((r) => r.categoryKey === categoryKey);

      const scoresArray = report?.factorResults?.map((factorResult) => (factorResult.result === 'Pass' ? 1 : 0)) || [];

      const categorysScoreSum: number = scoresArray.reduce((partialSum: number, a) => partialSum + a, 0);

      return categorysScoreSum;
    })
    .reduce((partialSum: number, a) => partialSum + a, 0);

  await prisma.tickerV1.update({
    data: {
      cachedScore: totalScore,
    },
    where: {
      id: tickerRecord.id,
    },
  });

  return {
    success: true,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
